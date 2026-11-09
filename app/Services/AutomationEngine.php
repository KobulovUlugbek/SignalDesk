<?php

namespace App\Services;

use App\Models\Automation;
use App\Models\Ticket;

class AutomationEngine
{
    public function applyOnCreate(Ticket $ticket, ActivityLogger $logger): void
    {
        $rules = Automation::query()->where('enabled', true)->where('trigger', 'ticket_created')
            ->whereIn('condition_priority', ['any', $ticket->priority])->orderBy('id')->get();

        foreach ($rules as $rule) {
            if ($rule->action === 'set_in_progress' && $ticket->status === 'open') {
                $ticket->update(['status' => 'in_progress']);
            }
            if ($rule->action === 'assign_agent' && $rule->assignee_id) {
                $ticket->update(['assignee_id' => $rule->assignee_id]);
            }
            $logger->record('automation', 'Regel ausgeführt: '.$rule->name, 'ticket', $ticket->id, $ticket->id);
        }
    }
}
