<?php

namespace App\Console\Commands;

use App\Models\Certificate;
use App\Models\DemoLead;
use App\Models\ExamPackage;
use App\Models\ExamToken;
use App\Models\Passage;
use App\Models\Question;
use App\Models\ScoreConversion;
use App\Models\Section;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PDO;

class ImportLegacyToefl extends Command
{
    protected $signature = 'toefl:import-legacy {--path= : Path to the legacy SQLite database}';

    protected $description = 'Import the legacy Prisma SQLite database into the Laravel MySQL schema.';

    /** @var array<string, array<string, string>> */
    private array $maps = [
        'AdminUser' => [], 'User' => [], 'ExamPackage' => [], 'Section' => [],
        'Passage' => [], 'Question' => [], 'ExamToken' => [], 'ExamSchedule' => [],
        'ExamSession' => [], 'ExamAnswer' => [], 'ExamResult' => [],
        'ExamRegistration' => [], 'Certificate' => [], 'DemoLead' => [],
    ];

    public function handle(): int
    {
        $optionPath = $this->option('path');
        $path = is_string($optionPath) && $optionPath !== ''
            ? $optionPath
            : (string) config('services.legacy_sqlite_path', 'C:/Users/satuh/Herd/mytoefl-project/prisma/toefl_itp.db');

        if (! is_file($path)) {
            $this->error("Legacy database not found: {$path}");

            return self::FAILURE;
        }

        $sqlite = new PDO('sqlite:'.$path);
        $sqlite->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $tableStatement = $sqlite->query("SELECT name FROM sqlite_master WHERE type = 'table'");
        if ($tableStatement === false) {
            throw new \RuntimeException('Unable to inspect legacy SQLite tables.');
        }
        /** @var array<int, string> $tables */
        $tables = array_map('strval', $tableStatement->fetchAll(PDO::FETCH_COLUMN));

        $this->info('Legacy tables: '.implode(', ', $tables));
        DB::transaction(function () use ($sqlite, $tables): void {
            $this->importAdmins($sqlite, $tables);
            $this->importUsers($sqlite, $tables);
            $this->importPackages($sqlite, $tables);
            $this->importSections($sqlite, $tables);
            $this->importPassages($sqlite, $tables);
            $this->importQuestions($sqlite, $tables);
            $this->importScores($sqlite, $tables);
            $this->importTokens($sqlite, $tables);
            $this->importSettings($sqlite, $tables);
            $this->importSchedules($sqlite, $tables);
            $this->importSessions($sqlite, $tables);
            $this->importAnswers($sqlite, $tables);
            $this->importResults($sqlite, $tables);
            $this->importRegistrations($sqlite, $tables);
            $this->importCertificates($sqlite, $tables);
            $this->importLeads($sqlite, $tables);
        });

        $this->info('Legacy TOEFL data imported successfully.');
        $this->line(sprintf('Packages: %d | Sections: %d | Passages: %d | Questions: %d | Tokens: %d', ExamPackage::count(), Section::count(), Passage::count(), Question::count(), ExamToken::count()));

        return self::SUCCESS;
    }

    /**
     * @param  array<int, string>  $tables
     * @return array<int, array<string, mixed>>
     */
    private function rows(PDO $db, array $tables, string $table): array
    {
        if (! in_array($table, $tables, true)) {
            return [];
        }
        $statement = $db->query('SELECT * FROM "'.$table.'"');
        if ($statement === false) {
            throw new \RuntimeException("Unable to read legacy table {$table}.");
        }

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    private function id(string $model, ?string $legacyId): ?string
    {
        return $legacyId === null ? null : ($this->maps[$model][$legacyId] ??= (string) Str::uuid());
    }

    /** @param array<string, mixed> $row */
    private function v(array $row, string $key, mixed $default = null): mixed
    {
        return array_key_exists($key, $row) ? $row[$key] : $default;
    }

    private function date(mixed $value): string
    {
        if (! $value) {
            return now()->toDateTimeString();
        }
        if (is_numeric($value)) {
            $timestamp = (float) $value;
            while ($timestamp > 10000000000) {
                $timestamp /= 1000;
            }

            return Carbon::createFromTimestamp((int) $timestamp)->toDateTimeString();
        }

        return (string) $value;
    }

    private function nullableDate(mixed $value): ?string
    {
        return $value ? $this->date($value) : null;
    }

    private function passwordHash(mixed $value): string
    {
        $hash = (string) $value;

        // bcryptjs emits $2b$ hashes; PHP's bcrypt verifier expects $2y$.
        return str_starts_with($hash, '$2b$') ? '$2y$'.substr($hash, 4) : $hash;
    }

    /** @param array<int, string> $tables */
    private function importAdmins(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'AdminUser') as $row) {
            $id = $this->id('AdminUser', $this->v($row, 'id'));
            DB::table('admin_users')->updateOrInsert(['username' => $this->v($row, 'username')], ['id' => $id, 'password' => $this->passwordHash($this->v($row, 'passwordHash', '')), 'name' => $this->v($row, 'name', 'Administrator'), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importUsers(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'User') as $row) {
            $email = strtolower((string) $this->v($row, 'email'));
            DB::table('users')->updateOrInsert(['email' => $email], ['name' => $this->v($row, 'name', ''), 'password' => $this->passwordHash($this->v($row, 'passwordHash', '')), 'id_number' => $this->v($row, 'idNumber'), 'phone_number' => $this->v($row, 'phoneNumber'), 'institution' => $this->v($row, 'institution'), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
            $this->maps['User'][$this->v($row, 'id')] = (string) User::where('email', $email)->value('id');
        }
    }

    /** @param array<int, string> $tables */
    private function importPackages(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamPackage') as $row) {
            DB::table('exam_packages')->updateOrInsert(['code' => $this->v($row, 'code')], ['id' => $this->id('ExamPackage', $this->v($row, 'id')), 'title' => $this->v($row, 'title', ''), 'description' => $this->v($row, 'description'), 'is_active' => (bool) $this->v($row, 'isActive', true), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
            $this->maps['ExamPackage'][$this->v($row, 'id')] = (string) ExamPackage::where('code', $this->v($row, 'code'))->value('id');
        }
    }

    /** @param array<int, string> $tables */
    private function importSections(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'Section') as $row) {
            DB::table('sections')->updateOrInsert(['id' => $this->id('Section', $this->v($row, 'id'))], ['package_id' => $this->id('ExamPackage', $this->v($row, 'packageId')), 'section_type' => $this->v($row, 'sectionType'), 'title' => $this->v($row, 'title', ''), 'duration_minutes' => (int) $this->v($row, 'durationMinutes', 0), 'order_index' => (int) $this->v($row, 'orderIndex', 0), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importPassages(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'Passage') as $row) {
            DB::table('passages')->updateOrInsert(['id' => $this->id('Passage', $this->v($row, 'id'))], ['section_id' => $this->id('Section', $this->v($row, 'sectionId')), 'title' => $this->v($row, 'title'), 'content' => $this->v($row, 'content'), 'audio_url' => $this->v($row, 'audioUrl'), 'order_index' => (int) $this->v($row, 'orderIndex', 0), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importQuestions(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'Question') as $row) {
            DB::table('questions')->updateOrInsert(['id' => $this->id('Question', $this->v($row, 'id'))], ['section_id' => $this->id('Section', $this->v($row, 'sectionId')), 'passage_id' => $this->id('Passage', $this->v($row, 'passageId')), 'question_number' => (int) $this->v($row, 'questionNumber', 0), 'question_text' => $this->v($row, 'questionText'), 'audio_url' => $this->v($row, 'audioUrl'), 'option_a' => $this->v($row, 'optionA', ''), 'option_b' => $this->v($row, 'optionB', ''), 'option_c' => $this->v($row, 'optionC', ''), 'option_d' => $this->v($row, 'optionD', ''), 'correct_answer' => $this->v($row, 'correctAnswer', 'A'), 'part_type' => $this->v($row, 'partType'), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importScores(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ScoreConversion') as $row) {
            ScoreConversion::updateOrCreate(['section_type' => $this->v($row, 'sectionType'), 'raw_score' => (int) $this->v($row, 'rawScore')], ['scaled_score' => (int) $this->v($row, 'scaledScore')]);
        }
    }

    /** @param array<int, string> $tables */
    private function importTokens(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamToken') as $row) {
            ExamToken::updateOrCreate(['token_code' => $this->v($row, 'tokenCode')], ['id' => $this->id('ExamToken', $this->v($row, 'id')), 'label' => $this->v($row, 'label', $this->v($row, 'tokenCode')), 'package_id' => $this->id('ExamPackage', $this->v($row, 'packageId')), 'is_used' => (bool) $this->v($row, 'isUsed', false)]);
        }
    }

    /** @param array<int, string> $tables */
    private function importSettings(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'SystemSetting') as $row) {
            SystemSetting::updateOrCreate(['key' => $this->v($row, 'key')], ['value' => $this->v($row, 'value', ''), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importSchedules(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamSchedule') as $row) {
            DB::table('exam_schedules')->updateOrInsert(['id' => $this->id('ExamSchedule', $this->v($row, 'id'))], ['package_id' => $this->id('ExamPackage', $this->v($row, 'packageId')), 'title' => $this->v($row, 'title', ''), 'description' => $this->v($row, 'description'), 'start_time' => $this->date($this->v($row, 'startTime')), 'end_time' => $this->date($this->v($row, 'endTime')), 'registration_deadline' => $this->nullableDate($this->v($row, 'registrationDeadline')), 'price' => (int) $this->v($row, 'price', 0), 'quota' => (int) $this->v($row, 'quota', 50), 'is_active' => (bool) $this->v($row, 'isActive', true), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importSessions(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamSession') as $row) {
            DB::table('exam_sessions')->updateOrInsert(['id' => $this->id('ExamSession', $this->v($row, 'id'))], ['package_id' => $this->id('ExamPackage', $this->v($row, 'packageId')), 'token_code' => $this->v($row, 'tokenCode', ''), 'participant_name' => $this->v($row, 'participantName', ''), 'user_id' => $this->maps['User'][$this->v($row, 'userId')] ?? null, 'current_section' => $this->v($row, 'currentSection', 'LISTENING'), 'status' => $this->v($row, 'status', 'IN_PROGRESS'), 'violation_count' => (int) $this->v($row, 'violationCount', 0), 'started_at' => $this->date($this->v($row, 'startedAt')), 'completed_at' => $this->nullableDate($this->v($row, 'completedAt')), 'created_at' => $this->date($this->v($row, 'startedAt')), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importAnswers(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamAnswer') as $row) {
            DB::table('exam_answers')->updateOrInsert(['session_id' => $this->id('ExamSession', $this->v($row, 'sessionId')), 'question_id' => $this->id('Question', $this->v($row, 'questionId'))], ['id' => $this->id('ExamAnswer', $this->v($row, 'id')), 'selected_answer' => $this->v($row, 'selectedAnswer'), 'is_marked_for_review' => (bool) $this->v($row, 'isMarkedForReview', false), 'created_at' => now(), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importResults(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamResult') as $row) {
            DB::table('exam_results')->updateOrInsert(['session_id' => $this->id('ExamSession', $this->v($row, 'sessionId'))], ['id' => $this->id('ExamResult', $this->v($row, 'id')), 'listening_raw' => (int) $this->v($row, 'listeningRaw', 0), 'listening_scaled' => (int) $this->v($row, 'listeningScaled', 0), 'structure_raw' => (int) $this->v($row, 'structureRaw', 0), 'structure_scaled' => (int) $this->v($row, 'structureScaled', 0), 'reading_raw' => (int) $this->v($row, 'readingRaw', 0), 'reading_scaled' => (int) $this->v($row, 'readingScaled', 0), 'total_score' => (int) $this->v($row, 'totalScore', 0), 'cefr_level' => $this->v($row, 'cefrLevel', 'A2'), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importRegistrations(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'ExamRegistration') as $row) {
            $userId = $this->maps['User'][$this->v($row, 'userId')] ?? null;
            if (! $userId) {
                continue;
            }
            DB::table('exam_registrations')->updateOrInsert(['registration_number' => $this->v($row, 'registrationNumber')], ['id' => $this->id('ExamRegistration', $this->v($row, 'id')), 'schedule_id' => $this->id('ExamSchedule', $this->v($row, 'scheduleId')), 'user_id' => $userId, 'amount' => (int) $this->v($row, 'amount', 0), 'status' => $this->v($row, 'status', 'CONFIRMED'), 'payment_method' => $this->v($row, 'paymentMethod', 'FREE_PASS'), 'payment_proof_url' => $this->v($row, 'paymentProofUrl'), 'payment_notes' => $this->v($row, 'paymentNotes'), 'rejection_reason' => $this->v($row, 'rejectionReason'), 'verified_at' => $this->nullableDate($this->v($row, 'verifiedAt')), 'verified_by' => $this->v($row, 'verifiedBy'), 'session_id' => $this->id('ExamSession', $this->v($row, 'sessionId')), 'created_at' => $this->date($this->v($row, 'createdAt')), 'updated_at' => now()]);
        }
    }

    /** @param array<int, string> $tables */
    private function importCertificates(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'Certificate') as $row) {
            $userId = $this->maps['User'][$this->v($row, 'userId')] ?? null;
            if (! $userId) {
                continue;
            }
            Certificate::updateOrCreate(['verification_code' => $this->v($row, 'verificationCode')], ['id' => $this->id('Certificate', $this->v($row, 'id')), 'certificate_number' => $this->v($row, 'certificateNumber'), 'user_id' => $userId, 'session_id' => $this->id('ExamSession', $this->v($row, 'sessionId')), 'participant_name' => $this->v($row, 'participantName', ''), 'id_number' => $this->v($row, 'idNumber'), 'test_date' => $this->date($this->v($row, 'testDate')), 'listening_score' => (int) $this->v($row, 'listeningScore', 0), 'structure_score' => (int) $this->v($row, 'structureScore', 0), 'reading_score' => (int) $this->v($row, 'readingScore', 0), 'total_score' => (int) $this->v($row, 'totalScore', 0), 'cefr_level' => $this->v($row, 'cefrLevel', 'A2'), 'is_revoked' => (bool) $this->v($row, 'isRevoked', false), 'issued_at' => $this->date($this->v($row, 'issuedAt'))]);
        }
    }

    /** @param array<int, string> $tables */
    private function importLeads(PDO $db, array $tables): void
    {
        foreach ($this->rows($db, $tables, 'DemoLead') as $row) {
            DemoLead::updateOrCreate(['id' => $this->id('DemoLead', $this->v($row, 'id'))], ['name' => $this->v($row, 'name', ''), 'phone_number' => $this->v($row, 'phoneNumber'), 'listening_raw' => (int) $this->v($row, 'listeningRaw', 0), 'listening_scaled' => (int) $this->v($row, 'listeningScaled', 0), 'structure_raw' => (int) $this->v($row, 'structureRaw', 0), 'structure_scaled' => (int) $this->v($row, 'structureScaled', 0), 'reading_raw' => (int) $this->v($row, 'readingRaw', 0), 'reading_scaled' => (int) $this->v($row, 'readingScaled', 0), 'total_score' => (int) $this->v($row, 'totalScore', 0), 'cefr_level' => $this->v($row, 'cefrLevel'), 'status' => $this->v($row, 'status', 'IN_PROGRESS'), 'answers_json' => $this->v($row, 'answersJson') ? json_decode($this->v($row, 'answersJson'), true) : null, 'started_at' => $this->date($this->v($row, 'startedAt')), 'completed_at' => $this->nullableDate($this->v($row, 'completedAt'))]);
        }
    }
}
