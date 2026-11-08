<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ExamSession extends ToeflModel
{
    /** @property-read ExamResult|null $result */
    protected $fillable = ['package_id', 'token_code', 'participant_name', 'user_id', 'current_section', 'status', 'violation_count', 'started_at', 'section_started_at', 'section_deadline_at', 'last_saved_at', 'package_snapshot', 'completed_at'];

    protected $casts = ['violation_count' => 'integer', 'started_at' => 'datetime', 'section_started_at' => 'datetime', 'section_deadline_at' => 'datetime', 'last_saved_at' => 'datetime', 'package_snapshot' => 'array', 'completed_at' => 'datetime'];

    /** @return BelongsTo<ExamPackage, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<ExamAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class, 'session_id');
    }

    /** @return HasOne<ExamResult, $this> */
    public function result(): HasOne
    {
        return $this->hasOne(ExamResult::class, 'session_id');
    }

    /** @return HasOne<ExamRegistration, $this> */
    public function registration(): HasOne
    {
        return $this->hasOne(ExamRegistration::class, 'session_id');
    }

    /** @return HasOne<Certificate, $this> */
    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class, 'session_id');
    }
}
