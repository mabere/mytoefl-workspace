<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamSchedule extends ToeflModel
{
    protected $fillable = ['package_id', 'title', 'description', 'start_time', 'end_time', 'timezone', 'registration_deadline', 'price', 'quota', 'is_active'];

    protected $casts = ['start_time' => 'datetime', 'end_time' => 'datetime', 'registration_deadline' => 'datetime', 'price' => 'integer', 'quota' => 'integer', 'is_active' => 'boolean'];

    /** @return BelongsTo<ExamPackage, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    /** @return HasMany<ExamRegistration, $this> */
    public function registrations(): HasMany
    {
        return $this->hasMany(ExamRegistration::class, 'schedule_id');
    }
}
