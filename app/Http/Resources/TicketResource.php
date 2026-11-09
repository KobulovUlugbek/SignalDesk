<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject' => $this->subject,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'channel' => $this->channel,
            'category' => $this->category,
            'due_at' => $this->due_at?->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'customer' => $this->whenLoaded('customer', fn () => $this->customer?->only(['id', 'name', 'company', 'plan', 'email'])),
            'assignee' => $this->whenLoaded('assignee', fn () => $this->assignee?->only(['id', 'name', 'role'])),
            'notes' => $this->whenLoaded('notes', fn () => $this->notes->map(fn ($note) => [
                'id' => $note->id,
                'body' => $note->body,
                'author' => $note->author?->name ?? 'System',
                'created_at' => $note->created_at->toIso8601String(),
            ])),
        ];
    }
}
