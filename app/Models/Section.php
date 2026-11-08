<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends ToeflModel
{
    protected $fillable = ['package_id', 'section_type', 'title', 'duration_minutes', 'order_index'];

    protected $casts = ['duration_minutes' => 'integer', 'order_index' => 'integer'];

    /** @return BelongsTo<ExamPackage, $this> */
    public function package(): BelongsTo
    {
        return $this->belongsTo(ExamPackage::class, 'package_id');
    }

    /** @return HasMany<Passage, $this> */
    public function passages(): HasMany
    {
        return $this->hasMany(Passage::class, 'section_id')->orderBy('order_index');
    }

    /** @return HasMany<Question, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'section_id')->orderBy('question_number');
    }
}
