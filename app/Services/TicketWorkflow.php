<?php

namespace App\Services;

use App\Models\Ticket;
use Illuminate\Support\Facades\DB;

class TicketWorkflow
{
    private const SLA_HOURS = ['urgent' => 2, 'high' => 8, 'medium' => 24, 'low' => 72];

    public function __construct(private ActivityLogger $logger, private AutomationEngine $engine) {}

    public function create(array $data): Ticket
    {
        return DB::transaction(function () use ($data): Ticket {
            $ticket = Ticket::create([
                ...$data,
                'channel' => $data['channel'] ?? 'portal',
                'category' => $data['category'] ?? 'technical',
                'status' => 'open',
                'due_at' => now()->addHours(self::SLA_HOURS[$data['priority']]),
            ]);
            $this->logger->record('created', 'Ticket erstellt: '.$ticket->subject, 'ticket', $ticket->id, $ticket->id);
            $this->engine->applyOnCreate($ticket, $this->logger);
            return $ticket->refresh()->load(['customer', 'assignee']);
        });
    }

    public function update(Ticket $ticket, array $data): Ticket
    {
        return DB::transaction(function () use ($ticket, $data): Ticket {
            $locked = Ticket::query()->lockForUpdate()->findOrFail($ticket->id);
            $changes = array_filter($data, fn ($value, $key) => $locked->{$key} != $value, ARRAY_FILTER_USE_BOTH);
            if ($changes) {
                if (array_key_exists('priority', $changes)) {
                    $changes['due_at'] = $locked->created_at->copy()->addHours(self::SLA_HOURS[$changes['priority']]);
                }
                if (array_key_exists('status', $changes)) {
                    $changes['resolved_at'] = $changes['status'] === 'resolved' ? now() : null;
                }
                $locked->update($changes);
                $this->logger->record('updated', 'Ticket aktualisiert: '.implode(', ', array_keys($changes)), 'ticket', $locked->id, $locked->id);
            }
            return $locked->load(['customer', 'assignee']);
        });
    }

    public function changeStatus(Ticket $ticket, string $status): Ticket
    {
        return $this->update($ticket, ['status' => $status]);
    }
}
