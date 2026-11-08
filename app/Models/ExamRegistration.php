<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamRegistration extends ToeflModel
{
    protected $fillable = ['schedule_id', 'user_id', 'registration_number', 'amount', 'status', 'payment_method', 'payment_proof_url', 'payment_proof_path', 'payment_notes', 'rejection_reason', 'verified_at', 'verified_by', 'session_id'];

    protected $casts = ['amount' => 'integer', 'verified_at' => 'datetime'];

    /** @return BelongsTo<ExamSchedule, $this> */
    public function schedule(): BelongsTo
    {
        return $this->belongsTo(ExamSchedule::class, 'schedule_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<ExamSession, $this> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }
}
