<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class ExamPackage extends ToeflModel
{
    protected $fillable = ['code', 'title', 'description', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    /** @return HasMany<Section, $this> */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class, 'package_id')->orderBy('order_index');
    }

    /** @return HasMany<ExamSession, $this> */
    public function sessions(): HasMany
    {
        return $this->hasMany(ExamSession::class, 'package_id');
    }

    /** @return HasMany<ExamToken, $this> */
    public function tokens(): HasMany
    {
        return $this->hasMany(ExamToken::class, 'package_id');
    }

    /** @return HasMany<ExamSchedule, $this> */
    public function schedules(): HasMany
    {
        return $this->hasMany(ExamSchedule::class, 'package_id');
    }
}
