<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends ToeflModel
{
    protected $fillable = ['certificate_number', 'user_id', 'session_id', 'participant_name', 'id_number', 'test_date', 'listening_score', 'structure_score', 'reading_score', 'total_score', 'cefr_level', 'verification_code', 'is_revoked', 'issued_at'];

    protected $casts = ['test_date' => 'datetime', 'issued_at' => 'datetime', 'is_revoked' => 'boolean'];

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
