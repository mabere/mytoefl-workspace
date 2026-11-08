<?php

namespace Tests\Audit;

use App\Models\AdminUser;
use App\Models\ExamAnswer;
use App\Models\ExamPackage;
use App\Models\ExamSession;
use App\Models\ExamToken;
use App\Models\User;
use App\Support\ToeflScoring;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/** Regression coverage for the production hardening fixes. */
class CurrentBehaviorAuditTest extends TestCase
{
    use RefreshDatabase;

    private function fixture(?User $user = null, bool $expired = false): array
    {
        $package = ExamPackage::create(['code' => uniqid('AUDIT-'), 'title' => 'Audit fixture', 'is_active' => true]);
        $section = $package->sections()->create(['section_type' => 'LISTENING', 'title' => 'Listening', 'duration_minutes' => 35, 'order_index' => 1]);
        $question = $section->questions()->create(['question_number' => 1, 'question_text' => 'Audit question', 'option_a' => 'A', 'option_b' => 'B', 'option_c' => 'C', 'option_d' => 'D', 'correct_answer' => 'A']);
        $startedAt = $expired ? now()->subDays(2) : now();
        $session = ExamSession::create(['package_id' => $package->id, 'participant_name' => 'Audit participant', 'token_code' => 'AUDIT', 'user_id' => $user?->id, 'started_at' => $startedAt, 'section_started_at' => $startedAt, 'section_deadline_at' => $startedAt->copy()->addMinutes(35), 'status' => 'IN_PROGRESS', 'current_section' => 'LISTENING']);

        return [$package, $question, $session];
    }

    public function test_guest_cannot_read_or_modify_a_session(): void
    {
        [, $question, $session] = $this->fixture();
        $this->getJson('/api/exam/'.$session->id)->assertNotFound();
        $this->postJson('/api/exam/answer', ['sessionId' => $session->id, 'questionId' => $question->id, 'selectedAnswer' => 'A'])->assertForbidden();
        $this->postJson('/api/exam/submit', ['sessionId' => $session->id])->assertNotFound();
    }

    public function test_user_me_endpoint_reflects_current_authentication(): void
    {
        $this->getJson('/api/auth/user-me')->assertUnauthorized()->assertJsonPath('authenticated', false);
        $user = User::factory()->create(['name' => 'Auth Audit']);

        $this->actingAs($user)->getJson('/api/auth/user-me')->assertOk()->assertJsonPath('authenticated', true)->assertJsonPath('user.name', 'Auth Audit');
    }

    public function test_review_only_request_preserves_existing_answer(): void
    {
        $user = User::factory()->create();
        [, $question, $session] = $this->fixture($user);
        $answer = ExamAnswer::create(['session_id' => $session->id, 'question_id' => $question->id, 'selected_answer' => 'A']);
        $this->actingAs($user)->postJson('/api/exam/answer', ['sessionId' => $session->id, 'questionId' => $question->id, 'isMarkedForReview' => true])->assertOk();
        $this->assertSame('A', $answer->fresh()->selected_answer);
        $this->assertTrue((bool) $answer->fresh()->is_marked_for_review);
        $this->assertDatabaseHas('audit_events', ['event' => 'exam.answer_saved', 'session_id' => $session->id]);
    }

    public function test_foreign_package_question_is_rejected(): void
    {
        $user = User::factory()->create();
        [, , $session] = $this->fixture($user);
        [, $foreignQuestion] = $this->fixture();
        $this->actingAs($user)->postJson('/api/exam/answer', ['sessionId' => $session->id, 'questionId' => $foreignQuestion->id, 'selectedAnswer' => 'A'])->assertStatus(422);
    }

    public function test_student_cannot_start_without_registration(): void
    {
        [$package] = $this->fixture();
        $this->actingAs(User::factory()->create())->postJson('/api/student/start-exam', ['packageId' => $package->id])->assertStatus(422);
    }

    public function test_used_token_cannot_create_a_second_session(): void
    {
        [$package] = $this->fixture();
        ExamToken::create(['token_code' => 'AUDIT-USED', 'label' => 'Audit', 'package_id' => $package->id, 'is_used' => true]);
        $this->postJson('/api/auth/token', ['tokenCode' => 'AUDIT-USED', 'participantName' => 'Audit guest'])->assertNotFound();
    }

    public function test_demo_result_hides_answer_key_until_completion(): void
    {
        $id = $this->postJson('/api/demo/start', ['name' => 'Audit demo'])->assertOk()->json('demoId');
        $this->getJson('/api/demo/result/'.$id)->assertOk()->assertJsonPath('lead.status', 'IN_PROGRESS')->assertJsonMissingPath('questions.0.correctAnswer');
    }

    public function test_zero_score_is_below_a2(): void
    {
        $result = ToeflScoring::result([]);
        $this->assertSame(310, $result['totalScore']);
        $this->assertSame('<A2', $result['cefrLevel']);
        $this->assertSame(ToeflScoring::VERSION, $result['scoringVersion']);
    }

    public function test_expiry_command_marks_overdue_sessions_and_blocks_them(): void
    {
        $user = User::factory()->create();
        [, , $session] = $this->fixture($user, true);

        Artisan::call('toefl:expire-sessions');

        $this->assertSame('EXPIRED', $session->fresh()->status);
        $this->actingAs($user)->getJson('/api/exam/'.$session->id)->assertOk()->assertJsonPath('status', 'EXPIRED')->assertJsonPath('isCompleted', true);
    }

    public function test_admin_cannot_publish_incomplete_package_import(): void
    {
        $admin = AdminUser::create(['username' => 'audit-import', 'password' => bcrypt('test-only-password'), 'name' => 'Audit']);
        $this->withSession(['admin_id' => $admin->id]);

        $this->postJson('/api/admin/packages', [
            'title' => 'Incomplete',
            'code' => 'INCOMPLETE-1',
            'rawJson' => ['sections' => [['sectionType' => 'LISTENING', 'durationMinutes' => 35, 'questions' => []]]],
        ])->assertStatus(422);
        $this->assertDatabaseMissing('exam_packages', ['code' => 'INCOMPLETE-1']);
    }

    public function test_public_certificate_does_not_expose_private_user_fields(): void
    {
        $user = User::factory()->create(['email' => 'audit-private@example.test', 'phone_number' => '0800000000']);
        [, , $session] = $this->fixture($user);
        $this->actingAs($user)->postJson('/api/exam/submit', ['sessionId' => $session->id])->assertOk();
        $code = $session->fresh()->certificate()->value('verification_code');
        $response = $this->getJson('/api/certificate/'.$code)->assertOk();
        $response->assertJsonMissingPath('certificate.user.email')->assertJsonMissingPath('certificate.user.phoneNumber');
    }

    public function test_client_cannot_bypass_future_schedule_start(): void
    {
        [$package] = $this->fixture();
        $package->sections()->createMany([
            ['section_type' => 'STRUCTURE', 'title' => 'Structure', 'duration_minutes' => 25, 'order_index' => 2],
            ['section_type' => 'READING', 'title' => 'Reading', 'duration_minutes' => 55, 'order_index' => 3],
        ]);
        $user = User::factory()->create();
        $schedule = $package->schedules()->create(['title' => 'Future', 'start_time' => now()->addDays(2), 'end_time' => now()->addDays(3), 'quota' => 10, 'price' => 0, 'is_active' => true]);
        $registration = $schedule->registrations()->create(['user_id' => $user->id, 'registration_number' => 'AUDIT-FUTURE', 'amount' => 0, 'status' => 'CONFIRMED']);
        $this->actingAs($user)->postJson('/api/student/start-exam', ['registrationId' => $registration->id, 'bypassTime' => true])->assertForbidden();
    }

    public function test_admin_session_list_uses_bounded_result_set(): void
    {
        $admin = AdminUser::create(['username' => 'audit', 'password' => bcrypt('test-only-password'), 'name' => 'Audit']);
        for ($i = 0; $i < 3; $i++) {
            $this->fixture();
        }
        $this->withSession(['admin_id' => $admin->id]);
        DB::enableQueryLog();
        $this->getJson('/api/admin/sessions?limit=2')->assertOk()->assertJsonCount(2, 'sessions')->assertJsonPath('limit', 2);
        DB::disableQueryLog();
    }
}
