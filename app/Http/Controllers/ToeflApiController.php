<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\DemoLead;
use App\Models\ExamAnswer;
use App\Models\ExamPackage;
use App\Models\ExamRegistration;
use App\Models\ExamResult;
use App\Models\ExamSchedule;
use App\Models\ExamSession;
use App\Models\ExamToken;
use App\Models\Passage;
use App\Models\Question;
use App\Models\SystemSetting;
use App\Models\User;
use App\Support\AuditLogger;
use App\Support\CertificateService;
use App\Support\DemoQuestionService;
use App\Support\ToeflScoring;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\File as FileRule;

class ToeflApiController extends Controller
{
    public function settings(): JsonResponse
    {
        return response()->json(['operatingMode' => SystemSetting::find('OPERATING_MODE')?->value ?: 'INSTITUTION']);
    }

    public function branding(): JsonResponse
    {
        $settings = SystemSetting::whereIn('key', ['INSTITUTION_LOGO_URL', 'INSTITUTION_NAME', 'INSTITUTION_ADDRESS', 'INSTITUTION_CONTACT'])->pluck('value', 'key');
        $logoUrl = $settings->get('INSTITUTION_LOGO_URL') ?: '/branding/institution-logo.svg';
        $institutionName = $settings->get('INSTITUTION_NAME') ?: 'Lembaga Bahasa & Sertifikasi Internasional';

        return response()->json([
            'logoUrl' => $this->normalizePublicAssetUrl((string) $logoUrl),
            'institutionName' => $institutionName,
            'institutionAddress' => $settings->get('INSTITUTION_ADDRESS') ?: '',
            'institutionContact' => $settings->get('INSTITUTION_CONTACT') ?: '',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['authenticated' => false], 401);
        }

        return response()->json(['authenticated' => true, 'user' => $this->studentPayload($user)]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc,dns', 'max:190'],
            'password' => ['required', 'string', 'min:12', 'max:128'],
            'idNumber' => ['nullable', 'string', 'max:80'],
            'phoneNumber' => ['nullable', 'string', 'max:40'],
        ]);
        $email = strtolower(trim((string) $data['email']));
        if (User::where('email', $email)->exists()) {
            return response()->json(['error' => 'Email sudah terdaftar. Silakan login.'], 409);
        }

        $user = User::create([
            'name' => trim((string) $data['name']), 'email' => $email, 'password' => Hash::make($data['password']),
            'id_number' => trim((string) ($data['idNumber'] ?? '')) ?: null, 'phone_number' => trim((string) ($data['phoneNumber'] ?? '')) ?: null,
        ]);
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['success' => true, 'user' => $this->studentPayload($user)]);
    }

    public function login(Request $request): JsonResponse
    {
        $email = strtolower(trim((string) $request->input('email')));
        $user = User::where('email', $email)->first();
        if (! $user || ! Hash::check((string) $request->input('password'), $user->password)) {
            return response()->json(['error' => 'Email atau kata sandi tidak sesuai.'], 401);
        }
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json(['success' => true, 'user' => $this->studentPayload($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['success' => true]);
    }

    public function tokenLogin(Request $request): JsonResponse
    {
        $name = trim((string) $request->input('participantName'));
        $code = strtoupper(trim((string) $request->input('tokenCode')));
        if (! $name || ! $code) {
            return response()->json(['error' => 'Nama peserta dan token ujian wajib diisi.'], 400);
        }
        $session = DB::transaction(function () use ($code, $name, $request): ExamSession {
            $token = ExamToken::with('package.sections')->where('token_code', $code)->lockForUpdate()->first();
            $package = $token?->package;
            if (! $token || ! $package || ! $package->is_active || $token->is_used) {
                abort(response()->json(['error' => 'Token ujian tidak valid, sudah digunakan, atau paket sedang nonaktif.'], 404));
            }
            $requiredSections = ['LISTENING', 'STRUCTURE', 'READING'];
            if (collect($requiredSections)->diff($package->sections->pluck('section_type'))->isNotEmpty()) {
                abort(response()->json(['error' => 'Paket ujian belum lengkap dan belum dapat digunakan.'], 422));
            }
            $section = $package->sections->firstWhere('section_type', 'LISTENING');
            $startedAt = now();
            $session = ExamSession::create([
                'package_id' => $package->id, 'token_code' => $code, 'participant_name' => $name,
                'current_section' => 'LISTENING', 'status' => 'IN_PROGRESS', 'started_at' => $startedAt,
                'section_started_at' => $startedAt, 'section_deadline_at' => $section ? $startedAt->copy()->addMinutes($section->duration_minutes) : null,
                'package_snapshot' => $this->packageSnapshot($package),
            ]);
            $token->update(['is_used' => true]);
            AuditLogger::record($request, 'exam.started', [
                'session_id' => $session->id,
                'auditable_type' => ExamPackage::class,
                'auditable_id' => $package->id,
                'metadata' => ['mode' => 'token', 'package_version' => $package->updated_at?->toISOString()],
            ]);

            return $session;
        });
        $request->session()->regenerate();
        $request->session()->put('exam_session_id', $session->id);
        $package = $session->package;

        return response()->json(['success' => true, 'sessionId' => $session->id, 'participantName' => $name, 'currentSection' => 'LISTENING', 'packageTitle' => $package->title]);
    }

    public function studentDashboard(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $registrations = ExamRegistration::with(['schedule.package.sections', 'session.result', 'session.certificate'])
            ->where('user_id', $user->id)->latest()->get();
        $registeredIds = $registrations->pluck('schedule_id')->all();
        $available = ExamSchedule::withCount('registrations')->with('package.sections')->where('is_active', true)
            ->when($registeredIds, fn ($query) => $query->whereNotIn('id', $registeredIds))->orderBy('start_time')->get();
        $certificates = Certificate::with('session.package')->where('user_id', $user->id)->latest('issued_at')->get();
        $packages = ExamPackage::with('sections')->where('is_active', true)->latest()->get();

        return response()->json([
            'student' => $this->studentPayload($user), 'registrations' => $this->camelize($registrations->toArray()),
            'availableSchedules' => $this->camelize($available->toArray()), 'certificates' => $this->camelize($certificates->toArray()),
            'packages' => $this->camelize($packages->toArray()),
        ]);
    }

    public function studentProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Sesi peserta tidak valid. Silakan login kembali.'], 401);
        }

        if ($request->isMethod('get')) {
            return response()->json(['student' => $this->studentPayload($user)]);
        }

        $name = trim((string) $request->input('name', $user->name));
        $idNumber = trim((string) $request->input('idNumber', (string) $user->id_number));
        $phoneNumber = trim((string) $request->input('phoneNumber', (string) $user->phone_number));
        $institution = trim((string) $request->input('institution', (string) $user->institution));

        if ($name === '' || mb_strlen($name) > 120) {
            return response()->json(['error' => 'Nama lengkap wajib diisi (maksimal 120 karakter).'], 422);
        }
        if (mb_strlen($idNumber) > 80) {
            return response()->json(['error' => 'Nomor identitas maksimal 80 karakter.'], 422);
        }
        if (mb_strlen($phoneNumber) > 40) {
            return response()->json(['error' => 'Nomor telepon/WhatsApp maksimal 40 karakter.'], 422);
        }
        if (mb_strlen($institution) > 190) {
            return response()->json(['error' => 'Nama institusi maksimal 190 karakter.'], 422);
        }

        $newPassword = (string) $request->input('newPassword', '');
        $currentPassword = (string) $request->input('currentPassword', '');
        $confirmPassword = (string) $request->input('confirmPassword', '');

        if ($newPassword !== '') {
            if ($currentPassword === '' || ! Hash::check($currentPassword, $user->password)) {
                return response()->json(['error' => 'Kata sandi saat ini tidak sesuai.'], 422);
            }
            if (mb_strlen($newPassword) < 8 || mb_strlen($newPassword) > 128) {
                return response()->json(['error' => 'Kata sandi baru minimal 8 karakter.'], 422);
            }
            if ($confirmPassword !== '' && $confirmPassword !== $newPassword) {
                return response()->json(['error' => 'Konfirmasi kata sandi baru tidak cocok.'], 422);
            }
            $user->password = Hash::make($newPassword);
        }

        if ($request->hasFile('photo')) {
            $request->validate([
                'photo' => [new FileRule()->types(['jpg', 'jpeg', 'png', 'webp'])->max('5mb')],
            ]);
            $file = $request->file('photo');
            $extension = strtolower((string) $file->extension()) ?: 'jpg';
            $filename = 'avatar_'.$user->id.'_'.Str::random(16).'.'.$extension;
            $storedPath = $file->storeAs('avatars', $filename, 'public');
            if (! is_string($storedPath)) {
                return response()->json(['error' => 'Gagal menyimpan foto profil.'], 500);
            }
            $this->deleteOldStudentPhoto($user->photo_url);
            $user->photo_url = '/storage/'.ltrim($storedPath, '/');
        } elseif ($request->boolean('removePhoto')) {
            $this->deleteOldStudentPhoto($user->photo_url);
            $user->photo_url = null;
        }

        // Email is explicitly NOT updated (read-only for participant)
        $user->name = $name;
        $user->id_number = $idNumber !== '' ? $idNumber : null;
        $user->phone_number = $phoneNumber !== '' ? $phoneNumber : null;
        $user->institution = $institution !== '' ? $institution : null;
        $user->save();

        AuditLogger::record($request, 'student.profile_updated', [
            'auditable_type' => User::class,
            'auditable_id' => (string) $user->id,
            'metadata' => [
                'password_changed' => $newPassword !== '',
                'photo_updated' => $request->hasFile('photo') || $request->boolean('removePhoto'),
            ],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui.',
            'student' => $this->studentPayload($user->fresh()),
        ]);
    }

    private function deleteOldStudentPhoto(?string $photoUrl): void
    {
        if (! $photoUrl) {
            return;
        }
        $normalized = $this->normalizePublicAssetUrl($photoUrl);
        if (str_starts_with($normalized, '/storage/avatars/')) {
            $relativePath = substr($normalized, strlen('/storage/'));
            $relativePath = explode('?', $relativePath)[0];
            if ($relativePath !== '' && Storage::disk('public')->exists($relativePath)) {
                Storage::disk('public')->delete($relativePath);
            }
        }
    }

    public function schedules(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        $schedules = ExamSchedule::withCount('registrations')->with(['package.sections', 'registrations' => fn ($query) => $query->where('user_id', $user->id)->with(['session.result', 'session.certificate'])])->where('is_active', true)->orderBy('start_time')->get();

        return response()->json(['schedules' => $this->camelize($schedules->toArray()), 'student' => $this->studentPayload($user)]);
    }

    public function enroll(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Sesi tidak valid. Silakan login kembali.'], 401);
        }
        $schedule = ExamSchedule::whereKey($request->input('scheduleId'))->first();
        if (! $schedule || ! $schedule->is_active) {
            return response()->json(['error' => 'Jadwal ujian tidak ditemukan atau telah ditutup.'], 404);
        }
        if ($schedule->registration_deadline && now()->gt($schedule->registration_deadline)) {
            return response()->json(['error' => 'Pendaftaran untuk jadwal ini sudah ditutup.'], 400);
        }

        $registration = DB::transaction(function () use ($schedule, $user, $request): ExamRegistration {
            $lockedSchedule = ExamSchedule::whereKey($schedule->id)->lockForUpdate()->firstOrFail();
            if (! $lockedSchedule->is_active) {
                abort(response()->json(['error' => 'Jadwal ujian sudah ditutup.'], 409));
            }
            if ($lockedSchedule->registration_deadline && now()->gt($lockedSchedule->registration_deadline)) {
                abort(response()->json(['error' => 'Pendaftaran untuk jadwal ini sudah ditutup.'], 409));
            }
            $existing = ExamRegistration::where('schedule_id', $lockedSchedule->id)->where('user_id', $user->id)->first();
            if ($existing) {
                return $existing;
            }
            if (ExamRegistration::where('schedule_id', $lockedSchedule->id)->whereNotIn('status', ['CANCELLED', 'REJECTED'])->count() >= $lockedSchedule->quota) {
                abort(response()->json(['error' => 'Kuota peserta untuk sesi ini sudah penuh.'], 400));
            }

            $paymentMethod = strtoupper((string) ($request->input('paymentMethod') ?: 'TRANSFER'));
            if (! in_array($paymentMethod, ['TRANSFER', 'CASH'], true)) {
                abort(response()->json(['error' => 'Metode pembayaran tidak valid.'], 422));
            }
            $status = $lockedSchedule->price > 0 ? ($paymentMethod === 'CASH' ? 'WAITING_APPROVAL' : 'PENDING_PAYMENT') : 'CONFIRMED';
            $method = $lockedSchedule->price > 0 ? ($paymentMethod === 'CASH' ? 'CASH' : 'TRANSFER') : 'FREE_PASS';

            return ExamRegistration::create(['schedule_id' => $lockedSchedule->id, 'user_id' => $user->id, 'registration_number' => 'REG-'.now()->format('Ym').'-'.strtoupper(Str::random(10)), 'amount' => $lockedSchedule->price, 'status' => $status, 'payment_method' => $method, 'payment_notes' => $request->input('paymentNotes') ?: null]);
        });
        if ($registration->wasRecentlyCreated === false) {
            return response()->json(['success' => true, 'alreadyRegistered' => true, 'registration' => $this->camelize($registration->toArray())]);
        }

        return response()->json(['success' => true, 'registration' => $this->camelize($registration->toArray())]);
    }

    public function paymentProof(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Sesi tidak valid. Silakan login kembali.'], 401);
        }
        $registration = ExamRegistration::where('id', $request->input('registrationId'))->where('user_id', $user->id)->first();
        $file = $request->file('proof');
        if (! $registration || ! $file) {
            return response()->json(['error' => 'ID pendaftaran dan bukti pembayaran wajib dilampirkan.'], 400);
        }
        if (in_array($registration->status, ['CONFIRMED', 'COMPLETED', 'CANCELLED'], true)) {
            return response()->json(['error' => 'Status pendaftaran ini tidak dapat diubah.'], 409);
        }
        $request->validate(['proof' => [new FileRule()->types(['jpg', 'jpeg', 'png', 'webp', 'pdf'])->max('10mb')], 'paymentNotes' => ['nullable', 'string', 'max:1000']]);
        $name = 'proof_'.$registration->registration_number.'_'.Str::random(20).'.'.$file->extension();
        $path = $file->storeAs('payments', $name, 'local');
        $registration->update(['payment_proof_path' => $path, 'payment_proof_url' => '/api/student/payment-proof/'.$registration->id, 'payment_notes' => $request->input('paymentNotes') ?: $registration->payment_notes, 'status' => 'WAITING_APPROVAL', 'rejection_reason' => null]);

        return response()->json(['success' => true, 'registration' => $this->camelize($registration->fresh()->toArray())]);
    }

    public function viewPaymentProof(Request $request, string $registrationId): mixed
    {
        $registration = ExamRegistration::whereKey($registrationId)->where('user_id', $request->user()?->id)->first();
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

    public function startExam(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['error' => 'Sesi peserta tidak valid. Silakan login kembali.'], 401);
        }
        if ($request->input('registrationId')) {
            $registration = DB::transaction(function () use ($request, $user): ExamRegistration {
                $registration = ExamRegistration::with(['schedule.package.sections', 'session'])
                    ->whereKey($request->input('registrationId'))
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->first();
                if (! $registration) {
                    abort(response()->json(['error' => 'Tiket pendaftaran ujian tidak ditemukan.'], 404));
                }
                if (in_array($registration->status, ['CANCELLED', 'PENDING_PAYMENT', 'WAITING_APPROVAL', 'REJECTED'], true)) {
                    abort(response()->json(['error' => $this->registrationError($registration), 'isPendingPayment' => $registration->status === 'PENDING_PAYMENT', 'isWaitingApproval' => $registration->status === 'WAITING_APPROVAL', 'isRejected' => $registration->status === 'REJECTED'], 403));
                }
                if ($registration->session) {
                    if (in_array($registration->session->status, ['COMPLETED', 'EXPIRED'], true)) {
                        abort(response()->json(['error' => 'Ujian untuk tiket ini telah selesai dikerjakan.'], 400));
                    }

                    return $registration;
                }
                if (collect(['LISTENING', 'STRUCTURE', 'READING'])->diff($registration->schedule->package->sections->pluck('section_type'))->isNotEmpty()) {
                    abort(response()->json(['error' => 'Paket ujian belum lengkap dan belum dapat dimulai.'], 422));
                }
                $now = now();
                $start = $registration->schedule->start_time;
                $end = $registration->schedule->end_time;
                if ($now->lt($start->copy()->subMinutes(15))) {
                    abort(response()->json(['error' => 'Ruang ujian belum dibuka.', 'isTooEarly' => true, 'startTime' => $start->toISOString()], 403));
                }
                if ($now->gt($end)) {
                    abort(response()->json(['error' => 'Batas waktu pelaksanaan sesi ujian telah berakhir.', 'isExpired' => true], 403));
                }
                $section = $registration->schedule->package->sections->firstWhere('section_type', 'LISTENING');
                $startedAt = now();
                $session = ExamSession::create(['package_id' => $registration->schedule->package_id, 'token_code' => $registration->registration_number, 'participant_name' => $user->name, 'user_id' => $user->id, 'current_section' => 'LISTENING', 'status' => 'IN_PROGRESS', 'started_at' => $startedAt, 'section_started_at' => $startedAt, 'section_deadline_at' => $section ? $startedAt->copy()->addMinutes($section->duration_minutes) : null, 'package_snapshot' => $this->packageSnapshot($registration->schedule->package)]);
                $registration->update(['session_id' => $session->id]);
                $registration->setRelation('session', $session);
                AuditLogger::record($request, 'exam.started', [
                    'session_id' => $session->id,
                    'auditable_type' => ExamRegistration::class,
                    'auditable_id' => $registration->id,
                    'metadata' => ['mode' => 'scheduled', 'schedule_id' => $registration->schedule_id],
                ]);

                return $registration;
            });

            return response()->json(['success' => true, 'sessionId' => $registration->session->id, 'packageTitle' => $registration->schedule->package->title]);
        }

        return response()->json(['error' => 'Pendaftaran ujian wajib digunakan untuk memulai sesi.'], 422);
    }

    public function exam(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->authorizedSession($request, $sessionId)?->load(['package.sections', 'answers']);
        if (! $session) {
            return response()->json(['error' => 'Test session not found.'], 404);
        }
        if (in_array($session->status, ['COMPLETED', 'EXPIRED'], true)) {
            return response()->json(['isCompleted' => true, 'status' => $session->status]);
        }
        $this->ensureSectionDeadline($session);
        if ($session->section_deadline_at && now()->greaterThan($session->section_deadline_at)) {
            return response()->json(['error' => 'Waktu section ini telah berakhir.', 'isExpired' => true], 403);
        }
        $section = $session->package->sections->firstWhere('section_type', $session->current_section);
        if (! $section) {
            return response()->json(['error' => 'Test section not found.'], 404);
        }
        $section->load(['passages', 'questions']);
        $saved = [];
        foreach ($session->answers as $answer) {
            $saved[$answer->question_id] = ['selectedAnswer' => $answer->selected_answer, 'isMarkedForReview' => (bool) $answer->is_marked_for_review];
        }

        return response()->json(['sessionId' => $session->id, 'participantName' => $session->participant_name, 'status' => $session->status, 'currentSectionType' => $section->section_type, 'sectionTitle' => $section->title, 'durationMinutes' => $section->duration_minutes, 'sectionStartedAt' => $session->section_started_at, 'sectionDeadlineAt' => $session->section_deadline_at, 'serverNow' => now(), 'timeRemainingSeconds' => $session->section_deadline_at ? max(0, now()->diffInSeconds($session->section_deadline_at, false)) : $section->duration_minutes * 60, 'totalQuestions' => $section->questions->count(), 'questions' => $section->questions->map(fn ($q) => $this->questionPayload($q))->values(), 'passages' => $section->passages->map(fn ($p) => $this->passagePayload($p))->values(), 'savedAnswers' => $saved, 'violationCount' => $session->violation_count]);
    }

    public function answer(Request $request): JsonResponse
    {
        $session = $this->authorizedSession($request, (string) $request->input('sessionId'));
        if (! $session || in_array($session->status, ['COMPLETED', 'EXPIRED'], true)) {
            return response()->json(['error' => 'Invalid or completed test session.'], 403);
        }
        if (! $request->input('questionId')) {
            return response()->json(['error' => 'Session or question ID is missing.'], 400);
        }
        $this->ensureSectionDeadline($session);
        if ($session->section_deadline_at && now()->greaterThan($session->section_deadline_at)) {
            return response()->json(['error' => 'Waktu section ini telah berakhir.'], 403);
        }
        $question = Question::whereKey($request->input('questionId'))->whereHas('section', fn ($query) => $query->where('package_id', $session->package_id)->where('section_type', $session->current_section))->first();
        if (! $question) {
            return response()->json(['error' => 'Soal tidak tersedia untuk section sesi ini.'], 422);
        }
        if ($request->has('selectedAnswer') && $request->input('selectedAnswer') !== null && ! in_array(strtoupper((string) $request->input('selectedAnswer')), ['A', 'B', 'C', 'D'], true)) {
            return response()->json(['error' => 'Pilihan jawaban tidak valid.'], 422);
        }
        if (! $request->hasAny(['selectedAnswer', 'isMarkedForReview'])) {
            return response()->json(['error' => 'Tidak ada perubahan jawaban.'], 422);
        }
        $answer = ExamAnswer::firstOrNew(['session_id' => $session->id, 'question_id' => $question->id]);
        if ($request->has('selectedAnswer')) {
            $answer->selected_answer = $request->input('selectedAnswer') === null ? null : strtoupper((string) $request->input('selectedAnswer'));
        }
        if ($request->has('isMarkedForReview')) {
            $answer->is_marked_for_review = (bool) $request->boolean('isMarkedForReview');
        }
        $answer->save();
        $session->update(['last_saved_at' => now()]);
        AuditLogger::record($request, 'exam.answer_saved', [
            'session_id' => $session->id,
            'auditable_type' => ExamAnswer::class,
            'auditable_id' => $answer->id,
            'metadata' => ['question_id' => $question->id, 'selected_answer' => $answer->selected_answer, 'is_marked_for_review' => (bool) $answer->is_marked_for_review],
        ]);

        return response()->json(['success' => true, 'answer' => $this->camelize($answer->toArray())]);
    }

    public function transition(Request $request): JsonResponse
    {
        $session = $this->authorizedSession($request, (string) $request->input('sessionId'));
        $next = $request->input('nextSection');
        $valid = ['LISTENING' => 'STRUCTURE', 'STRUCTURE' => 'READING'];
        if (! $session || in_array($session->status, ['COMPLETED', 'EXPIRED'], true)) {
            return response()->json(['error' => 'Invalid test session.'], 403);
        }
        if (($valid[$session->current_section] ?? null) !== $next) {
            return response()->json(['error' => 'Invalid section transition order.'], 400);
        }
        $this->ensureSectionDeadline($session);
        $nextSection = $session->package()->firstOrFail()->sections()->where('section_type', $next)->first();
        if (! $nextSection) {
            return response()->json(['error' => 'Section berikutnya tidak ditemukan.'], 422);
        }
        $fromSection = $session->current_section;
        $now = now();
        $startedAt = $session->section_deadline_at && $now->greaterThan($session->section_deadline_at)
            ? $session->section_deadline_at->copy()
            : $now;
        $session->update(['current_section' => $next, 'section_started_at' => $startedAt, 'section_deadline_at' => $startedAt->copy()->addMinutes($nextSection->duration_minutes)]);
        AuditLogger::record($request, 'exam.section_transitioned', [
            'session_id' => $session->id,
            'auditable_type' => ExamSession::class,
            'auditable_id' => $session->id,
            'metadata' => ['from' => $fromSection, 'to' => $next, 'started_at' => $startedAt->toISOString()],
        ]);

        return response()->json(['success' => true, 'currentSection' => $next]);
    }

    public function violation(Request $request): JsonResponse
    {
        $session = $this->authorizedSession($request, (string) $request->input('sessionId'));
        if (! $session || in_array($session->status, ['COMPLETED', 'EXPIRED'], true)) {
            return response()->json(['error' => 'Invalid or expired test session.'], 403);
        }
        $session->increment('violation_count');
        $session->refresh();
        AuditLogger::record($request, 'exam.violation_recorded', [
            'session_id' => $session->id,
            'auditable_type' => ExamSession::class,
            'auditable_id' => $session->id,
            'metadata' => ['violation_count' => $session->violation_count],
        ]);

        return response()->json(['success' => true, 'violationCount' => $session->violation_count, 'isMaxViolationsReached' => $session->violation_count >= 5]);
    }

    public function submit(Request $request): JsonResponse
    {
        $session = $this->authorizedSession($request, (string) $request->input('sessionId'))?->load(['answers.question.section', 'user', 'registration', 'result']);
        if (! $session) {
            return response()->json(['error' => 'Test session not found.'], 404);
        }
        $this->ensureSectionDeadline($session);
        if ($session->current_section !== 'READING' && $session->section_deadline_at && now()->greaterThan($session->section_deadline_at)) {
            return response()->json(['error' => 'Selesaikan perpindahan section sebelum mengirim ujian.'], 403);
        }
        $existing = $session->result;
        if ($existing) {
            return response()->json(['success' => true, 'isAlreadySubmitted' => true, 'result' => $this->resultPayload($existing), 'certificate' => app(CertificateService::class)->issue($session)]);
        }
        $raw = ['listeningRaw' => 0, 'structureRaw' => 0, 'readingRaw' => 0];
        $snapshotQuestions = $this->snapshotQuestionIndex($session);
        foreach ($session->answers as $answer) {
            $snapshotQuestion = $snapshotQuestions[(string) $answer->question_id] ?? null;
            $question = $answer->question;
            if ($snapshotQuestion) {
                $sectionType = $snapshotQuestion['sectionType'];
                $correctAnswer = $snapshotQuestion['correctAnswer'];
            } elseif ($question && $question->section && $question->section->package_id === $session->package_id) {
                $sectionType = $question->section->section_type;
                $correctAnswer = strtoupper(trim((string) $question->correct_answer));
            } else {
                continue;
            }
            $rawKey = strtolower($sectionType).'Raw';
            if (array_key_exists($rawKey, $raw) && $answer->selected_answer && strtoupper(trim($answer->selected_answer)) === $correctAnswer) {
                $raw[$rawKey]++;
            }
        }
        $scores = ToeflScoring::result($raw);
        $result = DB::transaction(function () use ($session, $scores, $request) {
            $locked = ExamSession::whereKey($session->id)->lockForUpdate()->firstOrFail();
            if ($existing = $locked->result()->first()) {
                return $existing;
            }
            $result = ExamResult::create(['session_id' => $session->id, 'listening_raw' => $scores['listeningRaw'], 'listening_scaled' => $scores['listeningScaled'], 'structure_raw' => $scores['structureRaw'], 'structure_scaled' => $scores['structureScaled'], 'reading_raw' => $scores['readingRaw'], 'reading_scaled' => $scores['readingScaled'], 'total_score' => $scores['totalScore'], 'cefr_level' => $scores['cefrLevel'], 'scoring_version' => $scores['scoringVersion'] ?? ToeflScoring::VERSION]);
            $locked->update(['status' => 'COMPLETED', 'completed_at' => now()]);
            AuditLogger::record($request, 'exam.submitted', [
                'session_id' => $locked->id,
                'auditable_type' => ExamResult::class,
                'auditable_id' => $result->id,
                'metadata' => ['total_score' => $result->total_score],
            ]);

            return $result;
        });
        $session->refresh()->load(['result', 'user', 'registration']);

        return response()->json(['success' => true, 'result' => array_merge($this->resultPayload($result), ['cefrDescription' => $scores['cefrDescription']]), 'certificate' => app(CertificateService::class)->issue($session)]);
    }

    public function result(Request $request, string $sessionId): JsonResponse
    {
        $session = $this->authorizedSession($request, $sessionId)?->load(['package', 'result', 'user', 'registration']);
        if (! $session || ! $session->result) {
            return response()->json(['error' => 'Hasil ujian tidak ditemukan atau ujian belum selesai.'], 404);
        }
        $certificate = app(CertificateService::class)->issue($session);

        return response()->json(['participantName' => $session->participant_name, 'tokenCode' => $session->token_code, 'packageTitle' => $session->package->title, 'completedAt' => $session->completed_at ?: $session->result->created_at, 'result' => array_merge($this->resultPayload($session->result), ['cefrDescription' => ToeflScoring::cefr($session->result->total_score)['description']]), 'certificate' => $certificate]);
    }

    public function demoStart(Request $request, DemoQuestionService $demo): JsonResponse
    {
        $name = trim((string) $request->input('name'));
        if (! $name) {
            return response()->json(['error' => 'Nama lengkap wajib diisi untuk memulai simulasi.'], 400);
        }
        if (mb_strlen($name) > 120) {
            return response()->json(['error' => 'Nama terlalu panjang.'], 422);
        }
        $phone = trim((string) $request->input('phoneNumber'));
        if (mb_strlen($phone) > 40) {
            return response()->json(['error' => 'Nomor telepon terlalu panjang.'], 422);
        }
        $lead = DemoLead::create(['name' => $name, 'phone_number' => $phone ?: null, 'status' => 'IN_PROGRESS', 'started_at' => now()]);
        AuditLogger::record($request, 'demo.started', ['auditable_type' => DemoLead::class, 'auditable_id' => $lead->id]);
        $request->session()->regenerate();
        $request->session()->put('demo_id', $lead->id);
        $questions = $demo->all($lead->id, true);

        return response()->json(['success' => true, 'demoId' => $lead->id, 'participantName' => $lead->name, 'phoneNumber' => $lead->phone_number, 'questions' => $questions['questions'], 'passages' => $questions['passages']]);
    }

    public function demoSubmit(Request $request, DemoQuestionService $demo): JsonResponse
    {
        $lead = DemoLead::whereKey($request->input('demoId'))->first();
        if (! $lead || (string) $request->session()->get('demo_id') !== (string) $lead->id) {
            return response()->json(['error' => 'Sesi demo tidak ditemukan.'], 404);
        }
        if ($lead->status === 'COMPLETED') {
            return response()->json(['error' => 'Simulasi ini sudah diselesaikan.'], 409);
        }
        $answers = (array) $request->input('answers', []);
        $data = $demo->all($lead->id);
        $raw = ['listeningRaw' => 0, 'structureRaw' => 0, 'readingRaw' => 0];
        foreach ($data['questions'] as $question) {
            $selected = $answers[(string) $question['number']] ?? ($answers[$question['id']] ?? null);
            if ($selected && strtoupper(trim($selected)) === $question['correctAnswer']) {
                $raw[strtolower($question['section']).'Raw']++;
            }
        }
        $scores = ToeflScoring::result($raw, true);
        $lead->update(['listening_raw' => $scores['listeningRaw'], 'listening_scaled' => $scores['listeningScaled'], 'structure_raw' => $scores['structureRaw'], 'structure_scaled' => $scores['structureScaled'], 'reading_raw' => $scores['readingRaw'], 'reading_scaled' => $scores['readingScaled'], 'total_score' => $scores['totalScore'], 'cefr_level' => $scores['cefrLevel'], 'status' => 'COMPLETED', 'completed_at' => now(), 'answers_json' => $answers]);
        AuditLogger::record($request, 'demo.submitted', ['auditable_type' => DemoLead::class, 'auditable_id' => $lead->id, 'metadata' => ['total_score' => $scores['totalScore']]]);

        return response()->json(['success' => true, 'demoId' => $lead->id, 'lead' => ['id' => $lead->id, 'name' => $lead->name, 'phoneNumber' => $lead->phone_number, 'createdAt' => $lead->created_at, 'completedAt' => $lead->completed_at], 'result' => $scores, 'questions' => $data['questions'], 'passages' => $data['passages'], 'userAnswers' => $answers]);
    }

    public function demoResult(Request $request, string $demoId, DemoQuestionService $demo): JsonResponse
    {
        $lead = DemoLead::find($demoId);
        if (! $lead || (string) $request->session()->get('demo_id') !== (string) $lead->id) {
            return response()->json(['error' => 'Data hasil simulasi tidak ditemukan.'], 404);
        }
        $data = $demo->all($lead->id, $lead->status !== 'COMPLETED');

        return response()->json(['success' => true, 'lead' => ['id' => $lead->id, 'name' => $lead->name, 'phoneNumber' => $lead->phone_number, 'status' => $lead->status, 'startedAt' => $lead->started_at, 'completedAt' => $lead->completed_at], 'result' => ['listeningRaw' => $lead->listening_raw, 'listeningScaled' => $lead->listening_scaled, 'structureRaw' => $lead->structure_raw, 'structureScaled' => $lead->structure_scaled, 'readingRaw' => $lead->reading_raw, 'readingScaled' => $lead->reading_scaled, 'totalScore' => $lead->total_score, 'cefrLevel' => $lead->cefr_level ?: '<A2'], 'questions' => $data['questions'], 'passages' => $data['passages'], 'userAnswers' => $lead->answers_json ?: []]);
    }

    public function certificate(string $verificationCode, Request $request): JsonResponse
    {
        $certificate = Certificate::with(['session.package'])->where('verification_code', $verificationCode)->first();
        if (! $certificate) {
            return response()->json(['error' => 'Sertifikat tidak ditemukan.'], 404);
        }
        $defaults = ['INSTITUTION_NAME' => 'Lembaga Bahasa & Sertifikasi Internasional', 'INSTITUTION_SUBTITLE' => 'Center for Language Testing and Certification', 'INSTITUTION_ADDRESS' => 'Gedung Pusat Bahasa Lt. 2, Kampus Terpadu', 'INSTITUTION_CONTACT' => 'Telp: (021) 7890123 • Email: toefl@lembagabahasa.ac.id', 'INSTITUTION_CITY' => 'Jakarta', 'INSTITUTION_LOGO_URL' => '/branding/institution-logo.svg', 'DIRECTOR_NAME' => 'Prof. Dr. H. Soedirman, M.Pd.', 'DIRECTOR_TITLE' => 'Academic Director of Certification', 'DIRECTOR_SIGNATURE_URL' => '/branding/director-signature.svg', 'INSTITUTION_STAMP_URL' => '/branding/institution-stamp.svg'];
        foreach (SystemSetting::whereIn('key', array_keys($defaults))->get() as $setting) {
            if ($setting->value) {
                $defaults[$setting->key] = in_array($setting->key, ['INSTITUTION_LOGO_URL', 'DIRECTOR_SIGNATURE_URL', 'INSTITUTION_STAMP_URL'], true)
                    ? $this->normalizePublicAssetUrl((string) $setting->value)
                    : $setting->value;
            }
        }
        $url = rtrim(config('app.url'), '/').'/verify/'.$certificate->verification_code;

        return response()->json(['certificate' => $this->certificatePayload($certificate), 'verifyUrl' => $url, 'qrDataUrl' => null, 'institution' => ['name' => $defaults['INSTITUTION_NAME'], 'subtitle' => $defaults['INSTITUTION_SUBTITLE'], 'address' => $defaults['INSTITUTION_ADDRESS'], 'contact' => $defaults['INSTITUTION_CONTACT'], 'city' => $defaults['INSTITUTION_CITY'], 'logoUrl' => $defaults['INSTITUTION_LOGO_URL'], 'directorName' => $defaults['DIRECTOR_NAME'], 'directorTitle' => $defaults['DIRECTOR_TITLE'], 'signatureUrl' => $defaults['DIRECTOR_SIGNATURE_URL'], 'stampUrl' => $defaults['INSTITUTION_STAMP_URL']]]);
    }

    private function registrationError(ExamRegistration $registration): string
    {
        return match ($registration->status) {
            'CANCELLED' => 'Tiket pendaftaran ini telah dibatalkan.',
            'PENDING_PAYMENT' => 'Pembayaran belum diselesaikan. Silakan unggah bukti transfer terlebih dahulu.',
            'WAITING_APPROVAL' => 'Pembayaran Anda sedang ditinjau oleh tim verifikator.',
            'REJECTED' => 'Pembayaran Anda ditolak: '.($registration->rejection_reason ?: 'Bukti transfer tidak valid'),
            default => 'Pendaftaran belum dapat digunakan untuk ujian.',
        };
    }

    private function authorizedSession(Request $request, string $sessionId): ?ExamSession
    {
        if ($sessionId === '') {
            return null;
        }
        $session = ExamSession::find($sessionId);
        if (! $session) {
            return null;
        }
        $user = $request->user();
        if ($session->user_id && $user && (string) $session->user_id === (string) $user->id) {
            return $session;
        }
        if (! $session->user_id && (string) $request->session()->get('exam_session_id') === (string) $session->id) {
            return $session;
        }

        return null;
    }

    /** @return array<string, mixed> */
    private function packageSnapshot(ExamPackage $package): array
    {
        $package->loadMissing(['sections.passages', 'sections.questions']);

        $sections = [];
        foreach ($package->sections as $section) {
            $passages = [];
            foreach ($section->passages as $passage) {
                $passages[] = [
                    'id' => $passage->id,
                    'title' => $passage->title,
                    'content' => $passage->content,
                    'audioUrl' => $passage->audio_url,
                    'orderIndex' => $passage->order_index,
                ];
            }

            $questions = [];
            foreach ($section->questions as $question) {
                $questions[] = [
                    'id' => $question->id,
                    'questionNumber' => $question->question_number,
                    'passageId' => $question->passage_id,
                    'questionText' => $question->question_text,
                    'audioUrl' => $question->audio_url,
                    'optionA' => $question->option_a,
                    'optionB' => $question->option_b,
                    'optionC' => $question->option_c,
                    'optionD' => $question->option_d,
                    'correctAnswer' => $question->correct_answer,
                    'partType' => $question->part_type,
                ];
            }

            $sections[] = [
                'id' => $section->id,
                'sectionType' => $section->section_type,
                'durationMinutes' => $section->duration_minutes,
                'passages' => $passages,
                'questions' => $questions,
            ];
        }

        return [
            'packageId' => $package->id,
            'capturedAt' => now()->toISOString(),
            'packageUpdatedAt' => $package->updated_at?->toISOString(),
            'sections' => $sections,
        ];
    }

    /** @return array<string, array{sectionType: string, correctAnswer: string}> */
    private function snapshotQuestionIndex(ExamSession $session): array
    {
        $index = [];
        foreach (($session->package_snapshot['sections'] ?? []) as $section) {
            foreach (($section['questions'] ?? []) as $question) {
                if (isset($question['id'])) {
                    $index[(string) $question['id']] = [
                        'sectionType' => (string) ($section['sectionType'] ?? ''),
                        'correctAnswer' => strtoupper((string) ($question['correctAnswer'] ?? '')),
                    ];
                }
            }
        }

        return $index;
    }

    private function ensureSectionDeadline(ExamSession $session): void
    {
        if ($session->section_deadline_at) {
            return;
        }
        $section = $session->package()->first()?->sections()->where('section_type', $session->current_section)->first();
        if (! $section) {
            return;
        }
        $startedAt = $session->section_started_at ?: $session->started_at;
        $session->update(['section_started_at' => $startedAt, 'section_deadline_at' => $startedAt->copy()->addMinutes($section->duration_minutes)]);
        $session->refresh();
    }

    /** @return array<string, mixed> */
    private function certificatePayload(Certificate $certificate): array
    {
        return [
            'id' => $certificate->id,
            'certificateNumber' => $certificate->certificate_number,
            'participantName' => $certificate->participant_name,
            'idNumber' => $certificate->id_number,
            'testDate' => $certificate->test_date,
            'listeningScore' => $certificate->listening_score,
            'structureScore' => $certificate->structure_score,
            'readingScore' => $certificate->reading_score,
            'totalScore' => $certificate->total_score,
            'cefrLevel' => $certificate->cefr_level,
            'verificationCode' => $certificate->verification_code,
            'isRevoked' => (bool) $certificate->is_revoked,
            'issuedAt' => $certificate->issued_at,
            'packageTitle' => $certificate->session?->package?->title,
            'packageCode' => $certificate->session?->package?->code,
        ];
    }

    /** @return array<string, mixed> */
    private function studentPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'idNumber' => $user->id_number,
            'phoneNumber' => $user->phone_number,
            'institution' => $user->institution,
            'photoUrl' => $user->photo_url ? $this->normalizePublicAssetUrl((string) $user->photo_url) : null,
            'createdAt' => $user->created_at,
        ];
    }

    /** @return array<string, mixed> */
    private function questionPayload(Question $question): array
    {
        return ['id' => $question->id, 'questionNumber' => $question->question_number, 'passageId' => $question->passage_id, 'questionText' => $question->question_text, 'audioUrl' => $question->audio_url, 'optionA' => $question->option_a, 'optionB' => $question->option_b, 'optionC' => $question->option_c, 'optionD' => $question->option_d, 'partType' => $question->part_type];
    }

    /** @return array<string, mixed> */
    private function passagePayload(Passage $passage): array
    {
        return ['id' => $passage->id, 'title' => $passage->title, 'content' => $passage->content, 'audioUrl' => $passage->audio_url, 'orderIndex' => $passage->order_index];
    }

    /** @return array<string, mixed> */
    private function resultPayload(ExamResult $result): array
    {
        return ['id' => $result->id, 'sessionId' => $result->session_id, 'listeningRaw' => $result->listening_raw, 'listeningScaled' => $result->listening_scaled, 'structureRaw' => $result->structure_raw, 'structureScaled' => $result->structure_scaled, 'readingRaw' => $result->reading_raw, 'readingScaled' => $result->reading_scaled, 'totalScore' => $result->total_score, 'cefrLevel' => $result->cefr_level, 'scoringVersion' => $result->scoring_version ?: ToeflScoring::VERSION, 'createdAt' => $result->created_at];
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

    private function normalizePublicAssetUrl(string $value): string
    {
        $value = trim($value);
        if ($value === '' || str_starts_with($value, '/storage/')) {
            return $value;
        }
        $parsed = parse_url($value);
        if (is_array($parsed) && isset($parsed['path']) && str_starts_with($parsed['path'], '/storage/')) {
            return $parsed['path'].(isset($parsed['query']) ? '?'.$parsed['query'] : '').(isset($parsed['fragment']) ? '#'.$parsed['fragment'] : '');
        }

        return $value;
    }
}
