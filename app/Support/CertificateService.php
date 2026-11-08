<?php

namespace App\Support;

use App\Models\Certificate;
use App\Models\ExamSession;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CertificateService
{
    public function issue(ExamSession $session): ?Certificate
    {
        if (! $session->user_id || ! $session->result) {
            return null;
        }

        return DB::transaction(function () use ($session): ?Certificate {
            $lockedSession = ExamSession::with(['result', 'user', 'registration'])->lockForUpdate()->find($session->id);
            if (! $lockedSession || ! $lockedSession->user_id || ! $lockedSession->result) {
                return null;
            }
            $existing = Certificate::where('session_id', $lockedSession->id)->first();
            if ($existing) {
                return $existing;
            }

            $now = now();
            $certificate = Certificate::create([
                'certificate_number' => sprintf('CERT/ITP/%s/%s/%s', $now->year, $now->format('m'), strtoupper(Str::random(10))),
                'user_id' => $lockedSession->user_id,
                'session_id' => $lockedSession->id,
                'participant_name' => $lockedSession->user?->name ?: $lockedSession->participant_name,
                'id_number' => $lockedSession->user?->id_number,
                'test_date' => $lockedSession->completed_at ?: $now,
                'listening_score' => $lockedSession->result->listening_scaled,
                'structure_score' => $lockedSession->result->structure_scaled,
                'reading_score' => $lockedSession->result->reading_scaled,
                'total_score' => $lockedSession->result->total_score,
                'cefr_level' => $lockedSession->result->cefr_level,
                'verification_code' => strtoupper(Str::random(16)),
                'issued_at' => $now,
            ]);

            if ($lockedSession->registration) {
                $lockedSession->registration->update(['status' => 'COMPLETED']);
            }

            return $certificate;
        });
    }
}
