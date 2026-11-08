<?php

namespace App\Http\Controllers;

use App\Models\AdminUser;
use App\Models\Certificate;
use App\Models\DemoLead;
use App\Models\ExamPackage;
use App\Models\ExamRegistration;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ExamSession;
use App\Models\ExamToken;
use App\Models\Passage;
use App\Models\Question;
use App\Models\Section;
use App\Models\SystemSetting;
use App\Services\DatabaseBackupService;
use App\Support\AuditLogger;
use DateTimeZone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File as FileRule;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AdminApiController extends Controller
{
    private const INSTITUTION_DEFAULTS = [
        'INSTITUTION_NAME' => 'Lembaga Bahasa & Sertifikasi Internasional',
        'INSTITUTION_SUBTITLE' => 'Center for Language Testing and Certification',
        'INSTITUTION_ADDRESS' => 'Gedung Pusat Bahasa Lt. 2, Kampus Terpadu',
        'INSTITUTION_CONTACT' => 'Telp: (021) 7890123 • Email: toefl@lembagabahasa.ac.id',
        'INSTITUTION_CITY' => 'Jakarta',
        'INSTITUTION_LOGO_URL' => '/branding/institution-logo.svg',
        'DIRECTOR_NAME' => 'Prof. Dr. H. Soedirman, M.Pd.',
        'DIRECTOR_TITLE' => 'Academic Director of Certification',
        'DIRECTOR_SIGNATURE_URL' => '/branding/director-signature.svg',
        'INSTITUTION_STAMP_URL' => '/branding/institution-stamp.svg',
    ];

    public function login(Request $request): JsonResponse
    {
        $admin = AdminUser::where('username', trim((string) $request->input('username')))->first();
        if (! $admin || ! Hash::check((string) $request->input('password'), $admin->password)) {
            return response()->json(['error' => 'Username atau password salah.'], 401);
        }
        $request->session()->put('admin_id', $admin->id);
        $request->session()->regenerate();

        return response()->json(['success' => true, 'admin' => $this->adminPayload($admin)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->session()->forget('admin_id');

        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $admin = $this->admin($request);

        return $admin ? response()->json(['authenticated' => true, 'admin' => $this->adminPayload($admin)]) : response()->json(['authenticated' => false], 401);
    }

    public function sessions(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $limit = min(max((int) $request->query('limit', 200), 1), 500);
        $sessions = ExamSession::with('result')->latest('started_at')->limit($limit)->get();
        $tokens = ExamToken::with('package')->latest()->limit($limit)->get();
        $completedCount = ExamSession::where('status', 'COMPLETED')->count();
        $totalSessions = ExamSession::count();
        $averageScore = (int) round((float) (ExamResult::whereHas('session', fn ($q) => $q->where('status', 'COMPLETED'))->avg('total_score') ?: 0));

        return response()->json(['summary' => ['totalSessions' => $totalSessions, 'completedCount' => $completedCount, 'inProgressCount' => max(0, $totalSessions - $completedCount), 'averageScore' => $averageScore, 'totalTokens' => ExamToken::count()], 'sessions' => $sessions->map(fn ($s) => ['id' => $s->id, 'participantName' => $s->participant_name, 'tokenCode' => $s->token_code, 'currentSection' => $s->current_section, 'status' => $s->status, 'startedAt' => $s->started_at, 'completedAt' => $s->completed_at, 'result' => $s->result ? ['listeningScaled' => $s->result->listening_scaled, 'structureScaled' => $s->result->structure_scaled, 'readingScaled' => $s->result->reading_scaled, 'totalScore' => $s->result->total_score, 'cefrLevel' => $s->result->cefr_level] : null]), 'tokens' => $this->camelize($tokens->toArray()), 'limit' => $limit]);
    }

    public function backups(Request $request, DatabaseBackupService $backupService): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        return response()->json([
            'backups' => $backupService->list(),
            'driver' => config('database.default'),
        ]);
    }

    public function createBackup(Request $request, DatabaseBackupService $backupService): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        try {
            $backup = $backupService->create();
            AuditLogger::record($request, 'database.backup_created', [
                'metadata' => [
                    'filename' => $backup['filename'],
                    'size' => $backup['size'],
                    'checksum' => $backup['checksum'],
                    'driver' => $backup['driver'],
                    'database' => $backup['database'],
                ],
            ]);

            return response()->json(['success' => true, 'backup' => $backup], 201);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['error' => 'Backup database gagal dibuat. Periksa konfigurasi mysqldump dan log aplikasi.'], 503);
        }
    }

    public function downloadBackup(Request $request, string $filename, DatabaseBackupService $backupService): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        try {
            $path = $backupService->download($filename);
            AuditLogger::record($request, 'database.backup_downloaded', ['metadata' => ['filename' => $filename]]);

            return response()->download($path, $filename, [
                'Content-Type' => 'application/gzip',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['error' => 'Berkas backup tidak ditemukan.'], 404);
        }
    }

    public function restoreBackup(Request $request, string $filename, DatabaseBackupService $backupService): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        if (strtoupper(trim((string) $request->input('confirmation'))) !== 'RESTORE') {
            return response()->json(['error' => 'Konfirmasi restore tidak valid. Ketik RESTORE untuk melanjutkan.'], 422);
        }

        if (ExamSession::where('status', 'IN_PROGRESS')->exists()) {
            return response()->json(['error' => 'Restore diblokir karena masih ada sesi ujian yang sedang berlangsung.'], 409);
        }

        try {
            $restore = $backupService->restore($filename);
            AuditLogger::record($request, 'database.backup_restored', [
                'metadata' => [
                    'filename' => $restore['filename'],
                    'database' => $restore['database'],
                    'checksum' => $restore['checksum'],
                    'safety_backup' => $restore['safetyBackup']['filename'] ?? null,
                ],
            ]);

            return response()->json(['success' => true, 'restore' => $restore]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['error' => 'Restore database gagal. Database aktif tidak dapat dipastikan sudah pulih; periksa log dan safety backup.'], 503);
        }
    }

    public function restoreUploadedBackup(Request $request, DatabaseBackupService $backupService): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        if (strtoupper(trim((string) $request->input('confirmation'))) !== 'RESTORE') {
            return response()->json(['error' => 'Konfirmasi restore tidak valid. Ketik RESTORE untuk melanjutkan.'], 422);
        }

        if (ExamSession::where('status', 'IN_PROGRESS')->exists()) {
            return response()->json(['error' => 'Restore diblokir karena masih ada sesi ujian yang sedang berlangsung.'], 409);
        }

        $file = $request->file('backup');
        if (! $file instanceof UploadedFile || ! $file->isValid()) {
            return response()->json(['error' => 'File backup .sql.gz wajib dipilih dan harus dapat dibaca.'], 422);
        }

        try {
            $restore = $backupService->restoreUploaded($file);
            AuditLogger::record($request, 'database.backup_restored_from_upload', [
                'metadata' => [
                    'filename' => $restore['filename'],
                    'database' => $restore['database'],
                    'checksum' => $restore['checksum'],
                    'safety_backup' => $restore['safetyBackup']['filename'] ?? null,
                ],
            ]);

            return response()->json(['success' => true, 'restore' => $restore]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['error' => 'Restore dari file gagal. Database aktif tidak dapat dipastikan sudah pulih; periksa log dan safety backup.'], 503);
        }
    }

    public function deleteBackup(Request $request, string $filename, DatabaseBackupService $backupService): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }

        if (strtoupper(trim((string) $request->input('confirmation'))) !== 'DELETE') {
            return response()->json(['error' => 'Konfirmasi penghapusan tidak valid. Ketik DELETE untuk melanjutkan.'], 422);
        }

        try {
            $deleted = $backupService->delete($filename);
            AuditLogger::record($request, 'database.backup_deleted', ['metadata' => $deleted]);

            return response()->json(['success' => true, 'deleted' => $deleted]);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json(['error' => 'Berkas backup tidak ditemukan atau gagal dihapus.'], 404);
        }
    }

    public function packages(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        if ($request->isMethod('get')) {
            $limit = min(max((int) $request->query('limit', 100), 1), 200);
            $packages = ExamPackage::with(['sections' => fn ($q) => $q->withCount(['questions', 'passages'])])->withCount(['sessions', 'tokens'])->latest()->limit($limit)->get();

            return response()->json(['packages' => $packages->map(fn ($pkg) => $this->packageSummary($pkg))->values(), 'limit' => $limit]);
        }
        $body = $request->all();
        $title = trim((string) ($body['title'] ?? ''));
        if (! $title) {
            return response()->json(['error' => 'Judul paket ujian wajib diisi.'], 400);
        }
        $code = strtoupper(trim((string) ($body['code'] ?? ''))) ?: 'ITP-PKG-'.now()->format('His');
        if (ExamPackage::where('code', $code)->exists()) {
            return response()->json(['error' => 'Kode paket sudah terdaftar.'], 400);
        }
        $raw = $body['rawJson'] ?? null;
        if (! is_array($raw)) {
            return response()->json(['error' => 'Paket harus menyertakan struktur rawJson hasil validasi import.'], 422);
        }
        if ($validationError = $this->validatePackageDefinition($raw)) {
            return response()->json(['error' => $validationError], 422);
        }
        $rawSections = $this->packageSections($raw['sections'] ?? null);
        $package = DB::transaction(function () use ($code, $title, $body, $raw, $rawSections) {
            $package = ExamPackage::create(['code' => $code, 'title' => $raw['title'] ?? $title, 'description' => $raw['description'] ?? ($body['description'] ?? null), 'is_active' => true]);
            $definitions = [['LISTENING', 'Section 1: Listening Comprehension', 35, 1], ['STRUCTURE', 'Section 2: Structure & Written Expression', 25, 2], ['READING', 'Section 3: Reading Comprehension', 55, 3]];
            foreach ($definitions as [$type, $sectionTitle, $duration, $order]) {
                $section = $package->sections()->create(['section_type' => $type, 'title' => $sectionTitle, 'duration_minutes' => $duration, 'order_index' => $order]);
                $imported = collect($rawSections)->first(fn (array $candidate): bool => ($candidate['sectionType'] ?? null) === $type);
                if (! is_array($imported)) {
                    continue;
                }
                $passageMap = [];
                foreach (($imported['passages'] ?? []) as $index => $p) {
                    $passage = $section->passages()->create(['title' => $p['title'] ?? null, 'content' => $p['content'] ?? null, 'audio_url' => $p['audioUrl'] ?? null, 'order_index' => $p['orderIndex'] ?? $index + 1]);
                    $passageMap[$p['passageIndex'] ?? $index + 1] = $passage->id;
                }
                foreach (($imported['questions'] ?? []) as $q) {
                    $section->questions()->create(['passage_id' => isset($q['passageIndex']) ? ($passageMap[$q['passageIndex']] ?? null) : null, 'question_number' => (int) ($q['questionNumber'] ?? 0), 'question_text' => $q['questionText'] ?? null, 'audio_url' => $q['audioUrl'] ?? null, 'option_a' => $q['optionA'] ?? '', 'option_b' => $q['optionB'] ?? '', 'option_c' => $q['optionC'] ?? '', 'option_d' => $q['optionD'] ?? '', 'correct_answer' => strtoupper($q['correctAnswer'] ?? 'A'), 'part_type' => $q['partType'] ?? null]);
                }
            }

            return $package;
        });
        AuditLogger::record($request, 'package.created', ['auditable_type' => ExamPackage::class, 'auditable_id' => $package->id, 'metadata' => ['code' => $package->code]]);

        return response()->json(['success' => true, 'message' => 'Paket ujian berhasil dibuat.', 'packageId' => $package->id]);
    }

    public function packageDetail(Request $request, string $packageId): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $package = ExamPackage::with(['sections.passages', 'sections.questions'])->find($packageId);

        return $package ? response()->json(['package' => $this->camelize($package->toArray())]) : response()->json(['error' => 'Paket ujian tidak ditemukan.'], 404);
    }

    public function deletePackage(Request $request, string $packageId): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $package = ExamPackage::find($packageId);
        if (! $package) {
            return response()->json(['error' => 'Paket tidak ditemukan.'], 404);
        }
        $count = ExamSession::where('package_id', $packageId)->count();
        if ($count) {
            return response()->json(['error' => "Paket tidak dapat dihapus karena sudah memiliki {$count} data riwayat ujian peserta."], 400);
        }
        $package->delete();
        AuditLogger::record($request, 'package.deleted', ['auditable_type' => ExamPackage::class, 'auditable_id' => $packageId]);

        return response()->json(['success' => true, 'message' => 'Paket berhasil dihapus.']);
    }

    public function togglePackage(Request $request, string $packageId): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $package = ExamPackage::find($packageId);
        if (! $package) {
            return response()->json(['error' => 'Paket tidak ditemukan.'], 404);
        }
        $package->update(['is_active' => ! $package->is_active]);
        AuditLogger::record($request, 'package.toggled', ['auditable_type' => ExamPackage::class, 'auditable_id' => $package->id, 'metadata' => ['is_active' => $package->is_active]]);

        return response()->json(['success' => true, 'isActive' => $package->is_active]);
    }

    public function tokens(Request $request): JsonResponse
    {
        $admin = $this->admin($request);
        if (! $admin) {
            return $this->unauthorized();
        }
        if ($request->isMethod('get')) {
            $limit = min(max((int) $request->query('limit', 100), 1), 500);

            return response()->json(['tokens' => $this->camelize(ExamToken::with('package')->latest()->limit($limit)->get()->toArray()), 'limit' => $limit]);
        }
        $customCode = strtoupper(trim((string) $request->input('customCode')));
        if ($customCode !== '' && (strlen($customCode) < 8 || strlen($customCode) > 64 || ! preg_match('/^[A-Z0-9-]+$/', $customCode))) {
            return response()->json(['error' => 'Kode token harus 8–64 karakter dan hanya berisi huruf, angka, atau tanda hubung.'], 422);
        }
        $code = $customCode ?: 'ITP-'.strtoupper(Str::random(12));
        if (ExamToken::where('token_code', $code)->exists()) {
            return response()->json(['error' => 'Kode token sudah digunakan.'], 400);
        }
        $packageId = $request->input('packageId') ?: ExamPackage::where('is_active', true)->latest()->value('id');
        $token = ExamToken::create(['token_code' => $code, 'label' => trim((string) ($request->input('label') ?: 'Sesi Ujian Internal')), 'package_id' => $packageId, 'is_used' => false]);
        AuditLogger::record($request, 'token.created', ['auditable_type' => ExamToken::class, 'auditable_id' => $token->id, 'metadata' => ['package_id' => $packageId]]);

        return response()->json(['success' => true, 'token' => $this->camelize($token->load('package')->toArray())]);
    }

    public function schedules(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        if ($request->isMethod('get')) {
            $limit = min(max((int) $request->query('limit', 100), 1), 200);
            $schedules = ExamSchedule::with([
                'package:id,code,title',
                'registrations' => fn ($query) => $query->select(['id', 'schedule_id', 'user_id', 'registration_number', 'status', 'session_id'])->latest(),
                'registrations.user:id,name,email,phone_number,id_number',
                'registrations.session:id,status,completed_at',
                'registrations.session.result:id,session_id,total_score,listening_scaled,structure_scaled,reading_scaled,cefr_level',
            ])->orderBy('start_time')->limit($limit)->get();

            return response()->json(['schedules' => $this->camelize($schedules->toArray()), 'limit' => $limit]);
        }
        if ($request->isMethod('delete')) {
            $schedule = ExamSchedule::whereKey($request->query('id'))->first();
            if (! $schedule) {
                return response()->json(['error' => 'ID jadwal diperlukan.'], 400);
            }
            if ($schedule->registrations()->exists()) {
                return response()->json(['error' => 'Jadwal memiliki riwayat pendaftaran dan tidak dapat dihapus. Nonaktifkan jadwal sebagai gantinya.'], 409);
            }
            $schedule->delete();
            AuditLogger::record($request, 'schedule.deleted', ['auditable_type' => ExamSchedule::class, 'auditable_id' => $schedule->id]);

            return response()->json(['success' => true]);
        }
        if ($request->isMethod('patch')) {
            $schedule = ExamSchedule::whereKey($request->input('id'))->first();
            if (! $schedule) {
                return response()->json(['error' => 'ID jadwal diperlukan.'], 400);
            }
            $schedule->update(['is_active' => (bool) $request->input('isActive')]);
            AuditLogger::record($request, 'schedule.toggled', ['auditable_type' => ExamSchedule::class, 'auditable_id' => $schedule->id, 'metadata' => ['is_active' => $schedule->is_active]]);

            return response()->json(['success' => true, 'schedule' => $this->camelize($schedule->toArray())]);
        }
        if (! $request->input('title') || ! $request->input('packageId') || ! $request->input('startTime') || ! $request->input('endTime')) {
            return response()->json(['error' => 'Judul, paket, waktu mulai dan selesai wajib diisi.'], 400);
        }
        $timezone = trim((string) ($request->input('timezone') ?: config('app.timezone')));
        if (! in_array($timezone, DateTimeZone::listIdentifiers(), true)) {
            return response()->json(['error' => 'Timezone jadwal tidak valid.'], 422);
        }
        try {
            $startTime = Carbon::parse((string) $request->input('startTime'), $timezone)->utc();
            $endTime = Carbon::parse((string) $request->input('endTime'), $timezone)->utc();
        } catch (\Throwable) {
            return response()->json(['error' => 'Format waktu jadwal tidak valid.'], 422);
        }
        if ($endTime->lessThanOrEqualTo($startTime)) {
            return response()->json(['error' => 'Waktu selesai harus setelah waktu mulai.'], 422);
        }
        $quota = min(max((int) ($request->input('quota') ?: 50), 1), 500);
        $price = max((int) ($request->input('price') ?: 0), 0);
        $schedule = ExamSchedule::create(['title' => trim((string) $request->input('title')), 'package_id' => $request->input('packageId'), 'start_time' => $startTime, 'end_time' => $endTime, 'timezone' => $timezone, 'quota' => $quota, 'price' => $price, 'description' => $request->input('description'), 'is_active' => true]);
        AuditLogger::record($request, 'schedule.created', ['auditable_type' => ExamSchedule::class, 'auditable_id' => $schedule->id, 'metadata' => ['timezone' => $timezone]]);

        return response()->json(['success' => true, 'schedule' => $this->camelize($schedule->load('package')->toArray())]);
    }

    public function payments(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        if ($request->isMethod('patch')) {
            return $this->paymentAction($request, (string) $request->route('registrationId'));
        }
        $query = ExamRegistration::with(['user', 'schedule.package', 'session.result'])->latest();
        if (($status = $request->query('status')) && $status !== 'ALL') {
            $query->where('status', $status);
        }
        $limit = min(max((int) $request->query('limit', 200), 1), 500);
        $registrations = $query->limit($limit)->get();
        $summary = [
            'waitingCount' => ExamRegistration::where('status', 'WAITING_APPROVAL')->count(),
            'confirmedCount' => ExamRegistration::whereIn('status', ['CONFIRMED', 'COMPLETED'])->count(),
            'pendingPaymentCount' => ExamRegistration::where('status', 'PENDING_PAYMENT')->count(),
            'rejectedCount' => ExamRegistration::where('status', 'REJECTED')->count(),
            'totalRevenue' => (int) ExamRegistration::whereIn('status', ['CONFIRMED', 'COMPLETED'])->sum('amount'),
        ];

        return response()->json(['registrations' => $this->camelize($registrations->toArray()), 'summary' => $summary, 'limit' => $limit]);
    }

    public function paymentAction(Request $request, string $registrationId): JsonResponse
    {
        $admin = $this->admin($request);
        if (! $admin) {
            return $this->unauthorized();
        }
        $action = strtoupper((string) $request->input('action'));
        if (! in_array($action, ['APPROVE', 'REJECT'], true)) {
            return response()->json(['error' => 'Aksi tidak valid.'], 400);
        }
        $registration = DB::transaction(function () use ($registrationId, $action, $request, $admin): ExamRegistration {
            $registration = ExamRegistration::whereKey($registrationId)->lockForUpdate()->first();
            if (! $registration) {
                abort(response()->json(['error' => 'Data pendaftaran tidak ditemukan.'], 404));
            }
            if (in_array($registration->status, ['COMPLETED', 'CANCELLED'], true)) {
                abort(response()->json(['error' => 'Status pendaftaran sudah final dan tidak dapat diubah.'], 409));
            }
            $registration->update(['status' => $action === 'APPROVE' ? 'CONFIRMED' : 'REJECTED', 'rejection_reason' => $action === 'REJECT' ? ($request->input('reason') ?: 'Bukti pembayaran tidak sesuai.') : null, 'verified_at' => now(), 'verified_by' => $admin->username]);
            AuditLogger::record($request, 'payment.'.strtolower($action), ['auditable_type' => ExamRegistration::class, 'auditable_id' => $registration->id, 'metadata' => ['status' => $registration->status]]);

            return $registration->fresh();
        });

        return response()->json(['success' => true, 'action' => $action, 'registration' => $this->camelize($registration->toArray())]);
    }

    public function paymentProof(Request $request, string $registrationId): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $registration = ExamRegistration::find($registrationId);
        if (! $registration) {
            return response()->json(['error' => 'Bukti pembayaran tidak ditemukan.'], 404);
        }
        if ($registration->payment_proof_path && Storage::disk('local')->exists($registration->payment_proof_path)) {
            return Storage::disk('local')->response($registration->payment_proof_path, basename($registration->payment_proof_path), ['Content-Disposition' => 'inline']);
        }
        $legacyPath = ltrim((string) $registration->payment_proof_url, '/');
        if ($legacyPath && is_file(public_path($legacyPath))) {
            return response()->file(public_path($legacyPath));
        }

        return response()->json(['error' => 'Bukti pembayaran tidak ditemukan.'], 404);
    }

    public function leads(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        if ($request->isMethod('delete')) {
            $leadId = (string) $request->query('id');
            DemoLead::where('id', $leadId)->delete();
            AuditLogger::record($request, 'demo_lead.deleted', ['auditable_type' => DemoLead::class, 'auditable_id' => $leadId]);

            return response()->json(['success' => true]);
        }
        $query = DemoLead::latest();
        if (($status = $request->query('status')) && $status !== 'ALL') {
            $query->where('status', $status);
        }
        if ($search = trim((string) $request->query('search'))) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('phone_number', 'like', "%{$search}%"));
        }
        $limit = min(max((int) $request->query('limit', 200), 1), 500);
        $leads = $query->limit($limit)->get();
        $completedCount = DemoLead::where('status', 'COMPLETED')->count();

        return response()->json(['success' => true, 'summary' => ['totalLeads' => DemoLead::count(), 'completedCount' => $completedCount, 'inProgressCount' => DemoLead::where('status', 'IN_PROGRESS')->count(), 'withPhoneCount' => DemoLead::whereNotNull('phone_number')->count(), 'averageScore' => $completedCount ? (int) round((float) DemoLead::where('status', 'COMPLETED')->avg('total_score')) : 0], 'leads' => $this->camelize($leads->toArray()), 'limit' => $limit]);
    }

    public function certificates(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $limit = min(max((int) $request->query('limit', 100), 1), 500);

        return response()->json(['certificates' => $this->camelize(Certificate::with(['user', 'session.package', 'session.registration.schedule'])->latest('issued_at')->limit($limit)->get()->toArray()), 'limit' => $limit]);
    }

    public function settings(Request $request): JsonResponse
    {
        if ($request->isMethod('put')) {
            if (! $this->admin($request)) {
                return $this->unauthorized();
            }
            $mode = $request->input('operatingMode');
            if (! in_array($mode, ['COMMERCIAL', 'INSTITUTION'], true)) {
                return response()->json(['error' => 'Mode operasional tidak valid.'], 400);
            }
            SystemSetting::updateOrCreate(['key' => 'OPERATING_MODE'], ['value' => $mode]);
            AuditLogger::record($request, 'settings.operating_mode_updated', ['metadata' => ['mode' => $mode]]);

            return response()->json(['success' => true, 'operatingMode' => $mode]);
        }

        return response()->json(['operatingMode' => SystemSetting::find('OPERATING_MODE')?->value ?: 'INSTITUTION']);
    }

    public function institutionSettings(Request $request): JsonResponse
    {
        if ($request->isMethod('post')) {
            if (! $this->admin($request)) {
                return $this->unauthorized();
            }
            foreach (array_keys(self::INSTITUTION_DEFAULTS) as $key) {
                if ($request->has($key)) {
                    $value = (string) $request->input($key);
                    if (in_array($key, ['INSTITUTION_LOGO_URL', 'DIRECTOR_SIGNATURE_URL', 'INSTITUTION_STAMP_URL'], true)) {
                        $value = $this->normalizePublicAssetUrl($value);
                    }
                    SystemSetting::updateOrCreate(['key' => $key], ['value' => $value]);
                }
            }

            return response()->json(['success' => true, 'message' => 'Pengaturan identitas lembaga berhasil disimpan.']);
        }
        $settings = self::INSTITUTION_DEFAULTS;
        foreach (SystemSetting::whereIn('key', array_keys($settings))->get() as $setting) {
            if ($setting->value) {
                $settings[$setting->key] = in_array($setting->key, ['INSTITUTION_LOGO_URL', 'DIRECTOR_SIGNATURE_URL', 'INSTITUTION_STAMP_URL'], true)
                    ? $this->normalizePublicAssetUrl((string) $setting->value)
                    : $setting->value;
            }
        }

        return response()->json(['settings' => $settings]);
    }

    public function uploadInstitutionAsset(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $request->validate(['file' => [new FileRule()->types(['jpg', 'jpeg', 'png', 'webp'])->max('5mb')], 'type' => ['required', 'in:logo,signature,stamp']]);
        $type = (string) $request->input('type');
        $key = match ($type) {
            'logo' => 'INSTITUTION_LOGO_URL',
            'signature' => 'DIRECTOR_SIGNATURE_URL',
            'stamp' => 'INSTITUTION_STAMP_URL',
            default => 'INSTITUTION_LOGO_URL',
        };
        $extension = strtolower((string) $request->file('file')->extension());
        $filename = $type === 'logo'
            ? 'institution-logo.'.$extension
            : $type.'_'.Str::random(20).'.'.$extension;
        $path = $type === 'logo'
            ? $this->storeOptimizedLogo($request->file('file'), $extension)
            : $request->file('file')->storeAs('branding', $filename, 'public');
        if (! is_string($path)) {
            return response()->json(['error' => 'File identitas lembaga gagal disimpan.'], 500);
        }

        // Logo updates use one canonical filename. Remove historical random
        // logo files and old extensions after the new file is safely stored.
        if ($type === 'logo') {
            $disk = Storage::disk('public');
            foreach ($disk->files('branding') as $candidate) {
                $candidateName = basename($candidate);
                if ($candidate !== $path && (str_starts_with($candidateName, 'logo_') || preg_match('/^institution-logo\\.[a-z0-9]+$/i', $candidateName))) {
                    $disk->delete($candidate);
                }
            }
        }

        $url = $this->publicStorageUrl($path).'?v='.now()->timestamp;
        SystemSetting::updateOrCreate(['key' => $key], ['value' => $url]);

        return response()->json(['success' => true, 'url' => $url]);
    }

    private function storeOptimizedLogo(UploadedFile $file, string $extension): ?string
    {
        $path = 'branding/institution-logo.'.$extension;
        if (! function_exists('imagecreatefromstring')) {
            return $file->storeAs('branding', basename($path), 'public') ?: null;
        }
        $contents = @file_get_contents($file->getRealPath());
        if (! is_string($contents)) {
            return null;
        }

        $source = @imagecreatefromstring($contents);
        if ($source === false) {
            return $file->storeAs('branding', basename($path), 'public') ?: null;
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $maxDimension = 1200;
        $scale = min(1, $maxDimension / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $target = imagecreatetruecolor($targetWidth, $targetHeight);

        if (in_array($extension, ['png', 'webp'], true)) {
            imagealphablending($target, false);
            imagesavealpha($target, true);
            $transparent = imagecolorallocatealpha($target, 0, 0, 0, 127);
            if ($transparent !== false) {
                imagefill($target, 0, 0, $transparent);
            }
        }
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);

        ob_start();
        $encoded = match ($extension) {
            'jpg', 'jpeg' => imagejpeg($target, null, 85),
            'png' => imagepng($target, null, 6),
            'webp' => imagewebp($target, null, 85),
            default => false,
        } ? ob_get_clean() : false;
        imagedestroy($source);
        imagedestroy($target);

        if (! is_string($encoded) || $encoded === '' || ! Storage::disk('public')->put($path, $encoded)) {
            return null;
        }

        return $path;
    }

    private function publicStorageUrl(string $path): string
    {
        return '/storage/'.ltrim(str_replace('\\', '/', $path), '/');
    }

    private function normalizePublicAssetUrl(string $value): string
    {
        $value = trim($value);
        if ($value === '') {
            return $value;
        }
        if (str_starts_with($value, '/storage/')) {
            return $value;
        }
        $parsed = parse_url($value);
        if (is_array($parsed) && isset($parsed['path']) && str_starts_with($parsed['path'], '/storage/')) {
            return $parsed['path'].(isset($parsed['query']) ? '?'.$parsed['query'] : '').(isset($parsed['fragment']) ? '#'.$parsed['fragment'] : '');
        }

        return $value;
    }

    public function question(Request $request, string $questionId): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $question = Question::find($questionId);
        if (! $question) {
            return response()->json(['error' => 'Soal tidak ditemukan.'], 404);
        }
        if (ExamSession::where('package_id', $question->section()->value('package_id'))->where('status', 'IN_PROGRESS')->exists()) {
            return response()->json(['error' => 'Paket sedang digunakan oleh peserta aktif dan tidak dapat diubah.'], 409);
        }
        $question->update(array_filter(['question_text' => $request->input('questionText'), 'option_a' => $request->input('optionA'), 'option_b' => $request->input('optionB'), 'option_c' => $request->input('optionC'), 'option_d' => $request->input('optionD'), 'correct_answer' => $request->filled('correctAnswer') ? strtoupper($request->input('correctAnswer')) : null, 'part_type' => $request->input('partType'), 'audio_url' => $request->input('audioUrl')], fn ($v) => $v !== null));
        AuditLogger::record($request, 'question.updated', ['auditable_type' => Question::class, 'auditable_id' => $question->id]);

        return response()->json(['success' => true, 'question' => $this->camelize($question->toArray())]);
    }

    public function passage(Request $request, string $passageId): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $passage = Passage::find($passageId);
        if (! $passage) {
            return response()->json(['error' => 'Passage tidak ditemukan.'], 404);
        }
        if (ExamSession::where('package_id', $passage->section()->value('package_id'))->where('status', 'IN_PROGRESS')->exists()) {
            return response()->json(['error' => 'Paket sedang digunakan oleh peserta aktif dan tidak dapat diubah.'], 409);
        }
        $passage->update(array_filter(['title' => $request->input('title'), 'content' => $request->input('content'), 'audio_url' => $request->input('audioUrl')], fn ($v) => $v !== null));
        AuditLogger::record($request, 'passage.updated', ['auditable_type' => Passage::class, 'auditable_id' => $passage->id]);

        return response()->json(['success' => true, 'passage' => $this->camelize($passage->toArray())]);
    }

    public function uploadAudio(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $request->validate(['audio' => [new FileRule()->types(['mp3', 'wav', 'ogg', 'm4a'])->max('50mb')]]);
        $file = $request->file('audio');
        $name = 'audio_'.now()->format('YmdHis').'_'.Str::random(16).'.'.$file->extension();
        $path = $file->storeAs('audio', $name, 'public');
        if (! is_string($path)) {
            return response()->json(['error' => 'File audio gagal disimpan.'], 500);
        }
        AuditLogger::record($request, 'audio.uploaded', ['metadata' => ['path' => $path, 'extension' => $file->extension()]]);

        return response()->json(['success' => true, 'url' => Storage::disk('public')->url($path), 'publicUrl' => Storage::disk('public')->url($path)]);
    }

    public function parseFile(Request $request): JsonResponse
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $request->validate(['file' => [new FileRule()->types(['json', 'xlsx', 'xls'])->max('20mb')]]);
        $file = $request->file('file');
        if (! $file) {
            return response()->json(['error' => 'File paket soal wajib diunggah.'], 400);
        }
        try {
            $extension = strtolower($file->getClientOriginalExtension());
            if ($extension === 'json' && (int) $file->getSize() > 5 * 1024 * 1024) {
                return response()->json(['error' => 'File JSON maksimal 5 MB agar import tetap aman dan ringan.'], 422);
            }
            $contents = file_get_contents($file->getRealPath());
            if ($extension === 'json' && $contents === false) {
                return response()->json(['error' => 'File paket tidak dapat dibaca.'], 422);
            }
            $package = $extension === 'json' ? json_decode((string) $contents, true, 512, JSON_THROW_ON_ERROR) : $this->parseSpreadsheet($file->getRealPath());
            if (! is_array($package)) {
                return response()->json(['error' => 'Struktur JSON paket harus berupa object.'], 422);
            }
            $issues = [];
            $counts = ['LISTENING' => 0, 'STRUCTURE' => 0, 'READING' => 0];
            $packageSections = $package['sections'] ?? [];
            if (! is_array($packageSections)) {
                $packageSections = [];
                $issues[] = ['section' => 'PACKAGE', 'questionNumber' => null, 'message' => 'Field sections harus berupa array.', 'severity' => 'error'];
            }
            foreach ($packageSections as $section) {
                if (! is_array($section)) {
                    $issues[] = ['section' => 'PACKAGE', 'questionNumber' => null, 'message' => 'Format section tidak valid.', 'severity' => 'error'];

                    continue;
                }
                $type = strtoupper($section['sectionType'] ?? '');
                if (array_key_exists($type, $counts)) {
                    $counts[$type] = count($section['questions'] ?? []);
                }
                foreach (($section['questions'] ?? []) as $question) {
                    if (! is_array($question)) {
                        $issues[] = ['section' => $type, 'questionNumber' => null, 'message' => 'Format soal tidak valid.', 'severity' => 'error'];

                        continue;
                    }
                    if (! in_array(strtoupper($question['correctAnswer'] ?? ''), ['A', 'B', 'C', 'D'], true)) {
                        $issues[] = ['section' => $type, 'questionNumber' => $question['questionNumber'] ?? null, 'message' => 'Kunci jawaban harus A, B, C, atau D.', 'severity' => 'error'];
                    }
                }
            }
            $definitionError = $this->validatePackageDefinition($package);
            if ($definitionError) {
                $issues[] = ['section' => 'PACKAGE', 'questionNumber' => null, 'message' => $definitionError, 'severity' => 'error'];
            }
            $total = array_sum($counts);
            if ($total > 1000) {
                return response()->json(['error' => 'Paket maksimal 1.000 soal per import.'], 422);
            }

            return response()->json(['success' => true, 'report' => ['isValid' => $total > 0 && ! collect($issues)->contains('severity', 'error'), 'totalQuestions' => $total, 'listeningCount' => $counts['LISTENING'], 'structureCount' => $counts['STRUCTURE'], 'readingCount' => $counts['READING'], 'issues' => $issues], 'packageData' => $package]);
        } catch (\Throwable $exception) {
            return response()->json(['error' => 'Gagal memproses file. Pastikan struktur file valid.'], 422);
        }
    }

    public function template(Request $request): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $data = [
            'title' => 'Simulasi TOEFL ITP Paket Baru',
            'code' => 'ITP-SAMPLE-PKG',
            'description' => 'Deskripsi paket ujian baru',
            'sections' => [
                ['sectionType' => 'LISTENING', 'title' => 'Section 1: Listening Comprehension', 'durationMinutes' => 35, 'orderIndex' => 1, 'passages' => [], 'questions' => [['questionNumber' => 1, 'partType' => 'PART_A', 'questionText' => 'What does the speaker mean?', 'optionA' => 'Option A', 'optionB' => 'Option B', 'optionC' => 'Option C', 'optionD' => 'Option D', 'correctAnswer' => 'A']]],
                ['sectionType' => 'STRUCTURE', 'title' => 'Section 2: Structure & Written Expression', 'durationMinutes' => 25, 'orderIndex' => 2, 'passages' => [], 'questions' => []],
                ['sectionType' => 'READING', 'title' => 'Section 3: Reading Comprehension', 'durationMinutes' => 55, 'orderIndex' => 3, 'passages' => [], 'questions' => []],
            ],
        ];

        return response()->streamDownload(fn () => print json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), 'Template_Bank_Soal_TOEFL_ITP.json', ['Content-Type' => 'application/json; charset=utf-8']);
    }

    public function templateExcel(Request $request): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $sheet = new Spreadsheet;
        $info = $sheet->getActiveSheet();
        $info->setTitle('INFO_PAKET');
        $info->fromArray([['Pengaturan', 'Nilai'], ['Judul Paket Ujian', 'Simulasi TOEFL ITP Paket Baru'], ['Kode Paket', 'ITP-SAMPLE-PKG'], ['Deskripsi', 'Paket simulasi TOEFL ITP']]);
        foreach ([['SECTION_1_LISTENING', ['No_Soal', 'Part_Type', 'Judul_Passage', 'Audio_Script', 'Audio_Url_MP3', 'Teks_Soal', 'Opsi_A', 'Opsi_B', 'Opsi_C', 'Opsi_D', 'Kunci_Jawaban']], ['SECTION_2_STRUCTURE', ['No_Soal', 'Part_Type', 'Teks_Soal', 'Opsi_A', 'Opsi_B', 'Opsi_C', 'Opsi_D', 'Kunci_Jawaban']], ['SECTION_3_READING', ['No_Soal', 'No_Passage', 'Judul_Passage', 'Teks_Bacaan', 'Teks_Soal', 'Opsi_A', 'Opsi_B', 'Opsi_C', 'Opsi_D', 'Kunci_Jawaban']]] as [$name, $headers]) {
            $sheet->createSheet()->setTitle($name)->fromArray([$headers]);
        }
        $writer = new Xlsx($sheet);

        return response()->streamDownload(fn () => $writer->save('php://output'), 'Template_Resmi_TOEFL_ITP.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
    }

    public function packageExport(Request $request, string $packageId): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $package = ExamPackage::with(['sections.passages', 'sections.questions'])->findOrFail($packageId);
        $data = ['code' => $package->code, 'title' => $package->title, 'description' => $package->description, 'exportedAt' => now()->toISOString(), 'sections' => $package->sections->map(fn (Section $section): array => $this->exportSection($section))->values()->all()];

        return response()->streamDownload(fn () => print json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), 'TOEFL_Package_'.$package->code.'_Export.json', ['Content-Type' => 'application/json; charset=utf-8']);
    }

    public function exportLeads(Request $request): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $headers = ['No', 'Nama Calon Peserta', 'Nomor WhatsApp', 'Status Pengerjaan', 'Listening Raw', 'Listening Scaled', 'Structure Raw', 'Structure Scaled', 'Reading Raw', 'Reading Scaled', 'Total Skor', 'Level CEFR', 'Waktu Mulai', 'Waktu Selesai'];

        return response()->streamDownload(function () use ($headers) {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            fputcsv($out, array_map(fn ($value) => $this->csvCell($value), $headers));
            $index = 0;
            foreach (DemoLead::query()->orderBy('id')->lazyById(500) as $lead) {
                $index++;
                fputcsv($out, array_map(fn ($value) => $this->csvCell($value), [$index, $lead->name, $lead->phone_number ?: '-', $lead->status === 'COMPLETED' ? 'Selesai' : 'Sedang Mengerjakan', $lead->listening_raw, $lead->listening_scaled, $lead->structure_raw, $lead->structure_scaled, $lead->reading_raw, $lead->reading_scaled, $lead->total_score, $lead->cefr_level ?: '-', $lead->started_at, $lead->completed_at ?: '-']));
            }
            fclose($out);
        }, 'Rekap-Calon-Peserta-Demo-TOEFL-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=utf-8']);
    }

    public function exportResults(Request $request): mixed
    {
        if (! $this->admin($request)) {
            return $this->unauthorized();
        }
        $query = ExamSession::with(['user', 'package', 'result', 'certificate', 'registration.schedule'])->where('status', 'COMPLETED');
        if ($scheduleId = $request->query('scheduleId')) {
            $query->whereHas('registration', fn ($q) => $q->where('schedule_id', $scheduleId));
        }
        $limit = min(max((int) $request->query('limit', 10000), 1), 10000);
        $sessionIds = (clone $query)->latest('completed_at')->limit($limit)->pluck('id')->all();
        $headers = ['No', 'No. Registrasi / Token', 'Nama Lengkap', 'Email', 'Paket Soal', 'Jadwal Sesi', 'Tanggal Ujian', 'Listening Raw', 'Listening Scaled', 'Structure Raw', 'Structure Scaled', 'Reading Raw', 'Reading Scaled', 'Total Skor TOEFL', 'Level CEFR', 'No. Seri Sertifikat', 'Kode Verifikasi'];

        return response()->streamDownload(function () use ($headers, $sessionIds) {
            $out = fopen('php://output', 'w');
            if ($out === false) {
                return;
            }
            fputcsv($out, array_map(fn ($value) => $this->csvCell($value), $headers));
            $index = 0;
            $positions = array_flip($sessionIds);
            foreach (array_chunk($sessionIds, 200) as $ids) {
                $sessions = ExamSession::with(['user', 'package', 'result', 'certificate', 'registration.schedule'])->whereIn('id', $ids)->get()->sortBy(fn (ExamSession $session): int => (int) ($positions[$session->id] ?? PHP_INT_MAX));
                foreach ($sessions as $s) {
                    $index++;
                    $row = [$index, $s->registration?->registration_number ?: $s->token_code, $s->user?->name ?: $s->participant_name, $s->user?->email ?: '-', $s->package?->title ?: '-', $s->registration?->schedule?->title ?: 'Sesi Langsung', $s->completed_at ?: '-', data_get($s->result, 'listening_raw', '-'), data_get($s->result, 'listening_scaled', '-'), data_get($s->result, 'structure_raw', '-'), data_get($s->result, 'structure_scaled', '-'), data_get($s->result, 'reading_raw', '-'), data_get($s->result, 'reading_scaled', '-'), data_get($s->result, 'total_score', '-'), data_get($s->result, 'cefr_level', '-'), $s->certificate?->certificate_number ?: 'Belum Terbit', $s->certificate?->verification_code ?: '-'];
                    fputcsv($out, array_map(fn ($value) => $this->csvCell($value), $row));
                }
            }
            fclose($out);
        }, 'Rekap-Nilai-TOEFL-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=utf-8']);
    }

    /** @return array<string, mixed> */
    private function parseSpreadsheet(string $path): array
    {
        $book = IOFactory::load($path);
        $package = ['title' => 'Paket Ujian Baru', 'code' => 'ITP-PKG-'.now()->format('His'), 'description' => 'Paket simulasi TOEFL ITP', 'sections' => []];
        $definitions = [['LISTENING', 'SECTION_1_LISTENING', 35, 1], ['STRUCTURE', 'SECTION_2_STRUCTURE', 25, 2], ['READING', 'SECTION_3_READING', 55, 3]];
        foreach ($definitions as [$type, $needle, $duration, $order]) {
            $sheet = collect($book->getSheetNames())->first(fn ($name) => str_contains(strtoupper($name), $needle));
            if (! $sheet) {
                continue;
            }
            $rows = $book->getSheetByName($sheet)->toArray(null, true, true, true);
            if (count($rows) > 1002) {
                $book->disconnectWorksheets();
                throw new \RuntimeException('Jumlah baris spreadsheet melebihi batas import.');
            }
            $headers = array_shift($rows);
            $mapped = [];
            foreach ($rows as $row) {
                $item = [];
                foreach ($headers as $column => $header) {
                    $item[(string) $header] = $row[$column] ?? null;
                } $mapped[] = $item;
            }
            $questions = [];
            $passages = [];
            $passageMap = [];
            foreach ($mapped as $row) {
                $number = (int) ($row['No_Soal'] ?? $row['No'] ?? 0);
                if (! $number) {
                    continue;
                } $passageIndex = $type === 'READING' ? (int) ($row['No_Passage'] ?? 1) : null;
                if ($passageIndex && ! isset($passageMap[$passageIndex])) {
                    $passageMap[$passageIndex] = true;
                    $passages[] = ['passageIndex' => $passageIndex, 'title' => $row['Judul_Passage'] ?? 'Passage '.$passageIndex, 'content' => $row['Teks_Bacaan'] ?? null];
                } $questions[] = ['questionNumber' => $number, 'partType' => strtoupper($row['Part_Type'] ?? ($type === 'STRUCTURE' && $number > 15 ? 'WRITTEN_EXPRESSION' : $type)), 'passageIndex' => $passageIndex, 'questionText' => $row['Teks_Soal'] ?? $row['Question'] ?? '', 'audioUrl' => $row['Audio_Url_MP3'] ?? null, 'optionA' => $row['Opsi_A'] ?? $row['A'] ?? '', 'optionB' => $row['Opsi_B'] ?? $row['B'] ?? '', 'optionC' => $row['Opsi_C'] ?? $row['C'] ?? '', 'optionD' => $row['Opsi_D'] ?? $row['D'] ?? '', 'correctAnswer' => strtoupper($row['Kunci_Jawaban'] ?? $row['Kunci'] ?? 'A')];
            }
            $package['sections'][] = ['sectionType' => $type, 'title' => 'Section '.$order.': '.($type === 'LISTENING' ? 'Listening Comprehension' : ($type === 'STRUCTURE' ? 'Structure & Written Expression' : 'Reading Comprehension')), 'durationMinutes' => $duration, 'orderIndex' => $order, 'passages' => $passages, 'questions' => $questions];
        }

        $book->disconnectWorksheets();

        return $package;
    }

    private function admin(Request $request): ?AdminUser
    {
        return ($id = $request->session()->get('admin_id')) ? AdminUser::whereKey($id)->first() : null;
    }

    private function unauthorized(): JsonResponse
    {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    private function csvCell(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        return in_array($value[0], ['=', '+', '-', '@'], true) ? "'".$value : $value;
    }

    /** @return array<string, mixed> */
    private function adminPayload(AdminUser $admin): array
    {
        return ['id' => $admin->id, 'username' => $admin->username, 'name' => $admin->name, 'createdAt' => $admin->created_at];
    }

    /** @return array<string, mixed> */
    private function packageSummary(ExamPackage $package): array
    {
        return ['id' => $package->id, 'code' => $package->code, 'title' => $package->title, 'description' => $package->description, 'isActive' => (bool) $package->is_active, 'createdAt' => $package->created_at, 'totalQuestions' => $package->sections->sum('questions_count'), 'totalSessions' => $package->sessions_count, 'totalTokens' => $package->tokens_count, 'sections' => $package->sections->map(fn (Section $section): array => ['id' => $section->id, 'sectionType' => $section->section_type, 'title' => $section->title, 'durationMinutes' => $section->duration_minutes, 'questionCount' => $section->questions_count])->values()->all()];
    }

    /** @return array<string, mixed> */
    private function exportSection(Section $section): array
    {
        return [
            'sectionType' => $section->section_type,
            'title' => $section->title,
            'durationMinutes' => $section->duration_minutes,
            'orderIndex' => $section->order_index,
            'passages' => $section->passages->map(fn (Passage $passage): array => [
                'passageIndex' => $passage->order_index,
                'title' => $passage->title,
                'content' => $passage->content,
                'audioUrl' => $passage->audio_url,
            ])->values()->all(),
            'questions' => $section->questions->map(fn (Question $question): array => [
                'questionNumber' => $question->question_number,
                'partType' => $question->part_type,
                'passageIndex' => $section->passages->firstWhere('id', $question->passage_id)?->order_index,
                'questionText' => $question->question_text,
                'audioUrl' => $question->audio_url,
                'optionA' => $question->option_a,
                'optionB' => $question->option_b,
                'optionC' => $question->option_c,
                'optionD' => $question->option_d,
                'correctAnswer' => $question->correct_answer,
            ])->values()->all(),
        ];
    }

    /** @param array<string, mixed> $raw */
    private function validatePackageDefinition(array $raw): ?string
    {
        $sections = $this->packageSections($raw['sections'] ?? null);
        if (count($sections) !== 3) {
            return 'Paket wajib memiliki tepat tiga section: LISTENING, STRUCTURE, dan READING.';
        }

        $byType = [];
        foreach ($sections as $section) {
            $type = strtoupper(trim((string) ($section['sectionType'] ?? '')));
            if (! in_array($type, ['LISTENING', 'STRUCTURE', 'READING'], true) || isset($byType[$type])) {
                return 'Tipe section tidak valid atau terduplikasi.';
            }
            $duration = (int) ($section['durationMinutes'] ?? 0);
            if ($duration < 1 || $duration > 180) {
                return "Durasi section {$type} harus antara 1 dan 180 menit.";
            }
            $questions = $section['questions'] ?? null;
            if (! is_array($questions) || count($questions) === 0) {
                return "Section {$type} wajib memiliki soal.";
            }
            $numbers = [];
            $passageIndexes = [];
            $passages = $section['passages'] ?? [];
            if (! is_array($passages)) {
                return "Passage {$type} tidak valid.";
            }
            foreach ($passages as $index => $passage) {
                if (! is_array($passage)) {
                    return "Passage {$type} tidak valid.";
                }
                $passageIndexes[(int) ($passage['passageIndex'] ?? ($index + 1))] = true;
                if (trim((string) ($passage['content'] ?? '')) === '' && trim((string) ($passage['audioUrl'] ?? '')) === '') {
                    return "Isi passage {$type} wajib diisi.";
                }
            }
            foreach ($questions as $question) {
                if (! is_array($question)) {
                    return "Format soal {$type} tidak valid.";
                }
                $number = (int) ($question['questionNumber'] ?? 0);
                if ($number < 1 || isset($numbers[$number])) {
                    return "Nomor soal {$type} harus unik dan lebih besar dari nol.";
                }
                $numbers[$number] = true;
                if (trim((string) ($question['questionText'] ?? '')) === '') {
                    return "Teks soal {$type} wajib diisi.";
                }
                foreach (['optionA', 'optionB', 'optionC', 'optionD'] as $option) {
                    if (trim((string) ($question[$option] ?? '')) === '') {
                        return "Semua opsi jawaban {$type} wajib diisi.";
                    }
                }
                if (! in_array(strtoupper(trim((string) ($question['correctAnswer'] ?? ''))), ['A', 'B', 'C', 'D'], true)) {
                    return "Kunci jawaban {$type} tidak valid.";
                }
                if (isset($question['passageIndex']) && ! isset($passageIndexes[(int) $question['passageIndex']])) {
                    return "Referensi passage pada soal {$type} tidak ditemukan.";
                }
            }
            $byType[$type] = true;
        }

        foreach (['LISTENING', 'STRUCTURE', 'READING'] as $required) {
            if (! isset($byType[$required])) {
                return "Section {$required} wajib tersedia.";
            }
        }

        return null;
    }

    /** @return array<int, array<string, mixed>> */
    private function packageSections(mixed $value): array
    {
        if (! is_array($value)) {
            return [];
        }

        $sections = [];
        foreach ($value as $section) {
            if (is_array($section)) {
                $sections[] = $section;
            }
        }

        return $sections;
    }

    private function camelize(mixed $value): mixed
    {
        if (! is_array($value)) {
            return $value;
        }
        if (array_is_list($value)) {
            return array_map(fn ($item) => $this->camelize($item), $value);
        }
        $result = [];
        foreach ($value as $key => $item) {
            $result[lcfirst(str_replace(' ', '', ucwords(str_replace('_', ' ', (string) $key))))] = $this->camelize($item);
        }

        return $result;
    }
}
