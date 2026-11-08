<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamResult extends ToeflModel
{
    /** @property int $listening_scaled @property int $structure_scaled @property int $reading_scaled @property int $total_score @property string $cefr_level */
    protected $fillable = ['session_id', 'listening_raw', 'listening_scaled', 'structure_raw', 'structure_scaled', 'reading_raw', 'reading_scaled', 'total_score', 'cefr_level', 'scoring_version'];

    protected $casts = ['listening_raw' => 'integer', 'listening_scaled' => 'integer', 'structure_raw' => 'integer', 'structure_scaled' => 'integer', 'reading_raw' => 'integer', 'reading_scaled' => 'integer', 'total_score' => 'integer'];

    /** @return BelongsTo<ExamSession, $this> */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ExamSession::class, 'session_id');
    }
}
