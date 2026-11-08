<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAnswer extends ToeflModel
{
    protected $fillable = ['session_id', 'question_id', 'selected_answer', 'is_marked_for_review'];

    protected $casts = ['is_marked_for_review' => 'boolean'];

    /** @return BelongsTo<ExamSession, $this> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }

    /** @return BelongsTo<Question, $this> */
    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'question_id');
    }
}
