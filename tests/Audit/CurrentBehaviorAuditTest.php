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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

    public function test_admin_can_manage_student_and_admin_users(): void
    {
        $this->getJson('/api/admin/users')->assertUnauthorized();
        $this->getJson('/api/admin/admin-users')->assertUnauthorized();

        $admin = AdminUser::create(['username' => 'superadmin', 'password' => bcrypt('password123'), 'name' => 'Super Admin']);
        $this->withSession(['admin_id' => $admin->id]);

        // Create student user
        $created = $this->postJson('/api/admin/users', [
            'name' => 'Peserta Baru',
            'email' => 'peserta.baru@example.test',
            'password' => 'rahasia123',
            'idNumber' => '19990101',
            'phoneNumber' => '08123456789',
            'institution' => 'Universitas Nusantara',
        ])->assertCreated()->json('user');

        $this->assertSame('Peserta Baru', $created['name']);

        // Update student user
        $this->putJson('/api/admin/users', [
            'id' => $created['id'],
            'name' => 'Peserta Terupdate',
            'email' => 'peserta.baru@example.test',
            'idNumber' => '19990202',
            'phoneNumber' => '08123456789',
            'institution' => 'Institut Teknologi',
            'password' => 'passwordbaru123',
        ])->assertOk()->assertJsonPath('user.name', 'Peserta Terupdate');

        // Delete student user without exam history succeeds
        $this->deleteJson('/api/admin/users?id='.$created['id'])->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $created['id']]);

        // Student with exam session cannot be deleted
        $studentWithExam = User::factory()->create();
        $this->fixture($studentWithExam);
        $this->deleteJson('/api/admin/users?id='.$studentWithExam->id)->assertStatus(409);

        // Create second admin user
        $secondAdmin = $this->postJson('/api/admin/admin-users', [
            'username' => 'proktor2',
            'name' => 'Proktor Dua',
            'password' => 'proktor12345',
        ])->assertCreated()->json('admin');

        // Cannot delete own active admin account
        $this->deleteJson('/api/admin/admin-users?id='.$admin->id)->assertStatus(409);

        // Can delete other admin account
        $this->deleteJson('/api/admin/admin-users?id='.$secondAdmin['id'])->assertOk();
        $this->assertDatabaseMissing('admin_users', ['id' => $secondAdmin['id']]);
    }

    public function test_student_can_update_profile_photo_password_and_personal_data_with_email_immutable(): void
    {
        Storage::fake('public');

        $user = User::create([
            'name' => 'Budi Santoso',
            'email' => 'budi.asli@example.test',
            'password' => bcrypt('passwordlama123'),
            'id_number' => '31710001',
            'phone_number' => '0811111111',
            'institution' => 'Kampus Lama',
        ]);

        $this->actingAs($user);

        // Update personal data, photo, and password while attempting to send a different email
        $response = $this->post('/api/student/profile', [
            'name' => 'Budi Santoso, S.Kom.',
            'email' => 'email.bajakan@example.test',
            'idNumber' => '31719999',
            'phoneNumber' => '0822222222',
            'institution' => 'Universitas Indonesia',
            'currentPassword' => 'passwordlama123',
            'newPassword' => 'passwordbaru456',
            'confirmPassword' => 'passwordbaru456',
            'photo' => UploadedFile::fake()->image('avatar.png', 200, 200),
        ])->assertOk()->json('student');

        $this->assertSame('Budi Santoso, S.Kom.', $response['name']);
        $this->assertSame('budi.asli@example.test', $response['email']);
        $this->assertSame('31719999', $response['idNumber']);
        $this->assertSame('0822222222', $response['phoneNumber']);
        $this->assertSame('Universitas Indonesia', $response['institution']);
        $this->assertNotEmpty($response['photoUrl']);

        $user->refresh();
        $this->assertSame('budi.asli@example.test', $user->email);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('passwordbaru456', $user->password));
    }

    public function test_admin_can_update_own_profile_with_email_and_photo_and_password(): void
    {
        Storage::fake('public');

        $admin = AdminUser::create([
            'username' => 'admin_pusat',
            'email' => 'admin.pusat@example.test',
            'name' => 'Admin Pusat',
            'password' => bcrypt('adminlama123'),
        ]);

        $this->withSession(['admin_id' => $admin->id]);

        $response = $this->post('/api/admin/profile', [
            'name' => 'Kepala Proktor Pusat',
            'username' => 'proktor_utama',
            'email' => 'proktor.utama@lembaga.test',
            'currentPassword' => 'adminlama123',
            'newPassword' => 'adminbaru456',
            'confirmPassword' => 'adminbaru456',
            'photo' => UploadedFile::fake()->image('admin_avatar.png', 200, 200),
        ])->assertOk()->json('admin');

        $this->assertSame('Kepala Proktor Pusat', $response['name']);
        $this->assertSame('proktor_utama', $response['username']);
        $this->assertSame('proktor.utama@lembaga.test', $response['email']);
        $this->assertNotEmpty($response['photoUrl']);

        $admin->refresh();
        $this->assertSame('Kepala Proktor Pusat', $admin->name);
        $this->assertSame('proktor_utama', $admin->username);
        $this->assertSame('proktor.utama@lembaga.test', $admin->email);
        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('adminbaru456', $admin->password));
    }
}
