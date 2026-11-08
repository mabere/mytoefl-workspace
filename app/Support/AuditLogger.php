<?php

namespace App\Support;

use App\Models\AdminUser;
use App\Models\AuditEvent;
use Illuminate\Http\Request;

final class AuditLogger
{
    /** @param array<string, mixed> $context */
    public static function record(Request $request, string $event, array $context = []): void
    {
        $adminId = $request->session()->get('admin_id');
        $user = $request->user();
        $actorType = $user ? $user::class : ($adminId ? AdminUser::class : null);
        $actorId = $user?->getKey() ?: ($adminId ? (string) $adminId : null);

        AuditEvent::create([
            'event' => $event,
            'actor_type' => $actorType,
            'actor_id' => $actorId,
            'session_id' => isset($context['session_id']) ? (string) $context['session_id'] : null,
            'auditable_type' => isset($context['auditable_type']) ? (string) $context['auditable_type'] : null,
            'auditable_id' => isset($context['auditable_id']) ? (string) $context['auditable_id'] : null,
            'metadata' => $context['metadata'] ?? null,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 2000),
            'created_at' => now(),
        ]);
    }
}
