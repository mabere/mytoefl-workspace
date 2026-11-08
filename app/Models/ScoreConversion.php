<?php

namespace App\Models;

class ScoreConversion extends ToeflModel
{
    protected $fillable = ['section_type', 'raw_score', 'scaled_score'];

    protected $casts = ['raw_score' => 'integer', 'scaled_score' => 'integer'];
}
