<?php

namespace App\Models;

class DemoLead extends ToeflModel
{
    protected $fillable = ['name', 'phone_number', 'listening_raw', 'listening_scaled', 'structure_raw', 'structure_scaled', 'reading_raw', 'reading_scaled', 'total_score', 'cefr_level', 'status', 'answers_json', 'started_at', 'completed_at'];

    protected $casts = ['listening_raw' => 'integer', 'listening_scaled' => 'integer', 'structure_raw' => 'integer', 'structure_scaled' => 'integer', 'reading_raw' => 'integer', 'reading_scaled' => 'integer', 'total_score' => 'integer', 'answers_json' => 'array', 'started_at' => 'datetime', 'completed_at' => 'datetime'];
}
