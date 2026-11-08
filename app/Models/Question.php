<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends ToeflModel
{
    protected $fillable = ['section_id', 'passage_id', 'question_number', 'question_text', 'audio_url', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'part_type'];

    protected $casts = ['question_number' => 'integer'];

    /** @return BelongsTo<Section, $this> */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    /** @return BelongsTo<Passage, $this> */
    public function passage(): BelongsTo
    {
        return $this->belongsTo(Passage::class, 'passage_id');
    }

    /** @return HasMany<ExamAnswer, $this> */
    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class, 'question_id');
    }
}
