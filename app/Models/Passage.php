<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Passage extends ToeflModel
{
    protected $fillable = ['section_id', 'title', 'content', 'audio_url', 'order_index'];

    protected $casts = ['order_index' => 'integer'];

    /** @return BelongsTo<Section, $this> */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    /** @return HasMany<Question, $this> */
    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'passage_id')->orderBy('question_number');
    }
}
