<?php

namespace App\Services;

use App\Models\ActivityEvent;

class ActivityLogger
{
    public function record(string $action, string $detail, string $entityType, ?int $entityId = null, ?int $ticketId = null): void
    {
        ActivityEvent::create([
            'ticket_id' => $ticketId,
            'actor_id' => auth()->id(),
            'action' => $action,
            'detail' => $detail,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
        ]);
    }
}
