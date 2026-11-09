<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityEvent;
use App\Models\Article;
use App\Models\Automation;
use App\Models\Customer;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InsightsController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $counts = Ticket::selectRaw('status, count(*) as count')->groupBy('status')->pluck('count', 'status');
        $open = (int) ($counts['open'] ?? 0) + (int) ($counts['in_progress'] ?? 0);
        return response()->json(['data' => [
            'metrics' => [
                'total_tickets' => Ticket::count(),
                'open_tickets' => $open,
                'resolved_tickets' => (int) ($counts['resolved'] ?? 0),
                'active_customers' => Customer::where('status', 'active')->count(),
                'sla_breaches' => Ticket::where('status', '!=', 'resolved')->where('due_at', '<', now())->count(),
                'pending_tasks' => Task::where('status', '!=', 'done')->count(),
                'active_automations' => Automation::where('enabled', true)->count(),
            ],
            'daily_volume' => $this->dailyVolume(14),
            'priority_breakdown' => Ticket::selectRaw('priority, count(*) as total')->groupBy('priority')->pluck('total', 'priority'),
            'recent_tickets' => Ticket::with(['customer', 'assignee'])->latest()->limit(6)->get(),
            'activity' => $this->activityQuery()->limit(7)->get(),
        ]]);
    }

    public function analytics(): JsonResponse
    {
        $resolved = Ticket::whereNotNull('resolved_at')->get(['created_at', 'resolved_at']);
        $average = $resolved->count() ? round($resolved->avg(fn ($ticket) => $ticket->created_at->diffInMinutes($ticket->resolved_at, false)) / 60, 1) : 0;
        return response()->json(['data' => [
            'volume' => $this->dailyVolume(14),
            'priority' => Ticket::selectRaw('priority, count(*) as count')->groupBy('priority')->get(),
            'channel' => Ticket::selectRaw('channel, count(*) as count')->groupBy('channel')->get(),
            'status' => Ticket::selectRaw('status, count(*) as count')->groupBy('status')->get(),
            'top_customers' => Customer::withCount('tickets')->orderByDesc('tickets_count')->limit(6)->get(['id', 'company', 'plan']),
            'team' => User::withCount(['tickets as assigned_count' => fn ($q) => $q->where('status', '!=', 'resolved')])->get(['id', 'name', 'role']),
            'avg_resolution_hours' => max(0, $average),
            'article_count' => Article::where('published', true)->count(),
        ]]);
    }

    public function activity(Request $request): JsonResponse
    {
        $query = $this->activityQuery();
        if ($request->filled('entity')) {
            $validated = $request->validate(['entity' => 'in:ticket,task,customer,article,automation']);
            $query->where('entity_type', $validated['entity']);
        }
        return response()->json($query->paginate(20));
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->validate(['q' => 'required|string|min:2|max:80'])['q']);
        return response()->json(['data' => [
            'tickets' => Ticket::where('subject', 'like', '%'.$q.'%')->limit(5)->get(['id', 'subject', 'status']),
            'customers' => Customer::where('company', 'like', '%'.$q.'%')->limit(5)->get(['id', 'company', 'plan']),
            'articles' => Article::where('title', 'like', '%'.$q.'%')->limit(5)->get(['id', 'title', 'category']),
        ]]);
    }

    public function team(): JsonResponse
    {
        return response()->json(['data' => User::query()->select('id', 'name', 'email', 'role')->withCount('tickets')->get()]);
    }

    public function export(): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return response()->streamDownload(function (): void {
            $out = fopen('php://output', 'w');
            fputcsv($out, ['ID', 'Titel', 'Kunde', 'Priorität', 'Status', 'Kanal', 'SLA', 'Erstellt']);
            Ticket::with('customer')->orderBy('id')->chunk(250, function ($tickets) use ($out): void {
                foreach ($tickets as $ticket) {
                    $values = [$ticket->id, $ticket->subject, $ticket->customer?->company, $ticket->priority, $ticket->status, $ticket->channel, $ticket->due_at?->toIso8601String(), $ticket->created_at?->toIso8601String()];
                    fputcsv($out, array_map(fn ($value) => is_string($value) && preg_match('/^[=+\-@\t\r]/', $value) ? "'".$value : $value, $values));
                }
            });
            fclose($out);
        }, 'signaldesk-tickets.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    private function activityQuery(): \Illuminate\Database\Eloquent\Builder
    {
        return ActivityEvent::with(['actor:id,name', 'ticket.customer:id,company'])->latest();
    }

    private function dailyVolume(int $days): array
    {
        $start = now()->startOfDay()->subDays($days - 1);
        $counts = Ticket::query()->where('created_at', '>=', $start)->selectRaw('DATE(created_at) as day, count(*) as count')->groupBy('day')->pluck('count', 'day');
        return collect(range($days - 1, 0))->map(fn ($offset) => [
            'date' => now()->subDays($offset)->toDateString(),
            'count' => (int) ($counts[now()->subDays($offset)->toDateString()] ?? 0),
        ])->all();
    }
}
