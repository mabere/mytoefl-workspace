<?php

namespace App\Models;

class AuditEvent extends ToeflModel
{
    public $timestamps = false;

    protected $fillable = [
        'event',
        'actor_type',
        'actor_id',
        'session_id',
        'auditable_type',
        'auditable_id',
        'metadata',
        'ip_address',
        'user_agent',
        'created_at',
    ];

    protected $casts = ['metadata' => 'array', 'created_at' => 'datetime'];
}
