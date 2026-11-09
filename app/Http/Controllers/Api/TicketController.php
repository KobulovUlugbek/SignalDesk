<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Resources\TicketResource;
use App\Models\Ticket;
use App\Models\TicketNote;
use App\Services\ActivityLogger;
use App\Services\TicketWorkflow;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class TicketController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = Validator::make($request->only(['q', 'status', 'priority', 'page', 'customer_id']), [
            'q' => ['sometimes', 'string', 'max:120'],
            'status' => ['sometimes', Rule::in(['open', 'in_progress', 'resolved'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'page' => ['sometimes', 'integer', 'min:1'],
            'customer_id' => ['sometimes', 'integer'],
        ])->validate();
        $tickets = Ticket::query()->with(['customer', 'assignee'])
            ->when($filters['q'] ?? null, fn ($query, $q) => $query->where(fn ($builder) => $builder->where('subject', 'like', '%'.$q.'%')->orWhereHas('customer', fn ($customer) => $customer->where('company', 'like', '%'.$q.'%'))))
            ->when($filters['status'] ?? null, fn ($query, $v) => $query->where('status', $v))
            ->when($filters['priority'] ?? null, fn ($query, $v) => $query->where('priority', $v))
            ->when($filters['customer_id'] ?? null, fn ($query, $v) => $query->where('customer_id', $v))
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
            ->latest('created_at')->paginate(12)->withQueryString();
        return TicketResource::collection($tickets);
    }

    public function show(Ticket $ticket): TicketResource
    {
        return new TicketResource($ticket->load(['customer', 'assignee', 'notes.author']));
    }

    public function store(StoreTicketRequest $request, TicketWorkflow $workflow): JsonResponse
    {
        return (new TicketResource($workflow->create($request->validated())))->response()->setStatusCode(201);
    }

    public function update(Request $request, Ticket $ticket, TicketWorkflow $workflow): TicketResource
    {
        $data = $request->validate([
            'subject' => ['sometimes', 'string', 'min:5', 'max:160'],
            'description' => ['sometimes', 'string', 'min:10', 'max:5000'],
            'status' => ['sometimes', Rule::in(['open', 'in_progress', 'resolved'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'assignee_id' => ['sometimes', 'nullable', 'exists:users,id'],
            'category' => ['sometimes', Rule::in(['technical', 'billing', 'account', 'feature'])],
        ]);
        return new TicketResource($workflow->update($ticket, $data));
    }

    public function note(Request $request, Ticket $ticket, ActivityLogger $logger): JsonResponse
    {
        $data = $request->validate(['body' => ['required', 'string', 'min:2', 'max:3000']]);
        $note = TicketNote::create(['ticket_id' => $ticket->id, 'user_id' => $request->user()->id, 'body' => $data['body']]);
        $logger->record('note', 'Interne Notiz ergänzt', 'ticket', $ticket->id, $ticket->id);
        return response()->json(['data' => ['id' => $note->id, 'body' => $note->body]], 201);
    }
}
