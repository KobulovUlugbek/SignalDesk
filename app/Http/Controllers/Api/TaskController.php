<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Task::with(['assignee:id,name,role', 'ticket:id,subject'])->orderBy('created_at', 'desc')->get()]);
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $this->validated($request);
        $task = Task::create($data);
        $logger->record('created', 'Aufgabe erstellt: '.$task->title, 'task', $task->id);
        return response()->json(['data' => $task->load(['assignee', 'ticket'])], 201);
    }

    public function update(Request $request, Task $task, ActivityLogger $logger): JsonResponse
    {
        $task->update($this->validated($request, true));
        $logger->record('updated', 'Aufgabe aktualisiert: '.$task->title, 'task', $task->id);
        return response()->json(['data' => $task->load(['assignee', 'ticket'])]);
    }

    public function destroy(Task $task, ActivityLogger $logger): JsonResponse
    {
        $logger->record('deleted', 'Aufgabe gelöscht: '.$task->title, 'task', $task->id);
        $task->delete();
        return response()->json(['ok' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'title' => [$required, 'string', 'min:3', 'max:180'],
            'description' => ['nullable', 'string', 'max:3000'],
            'status' => ['sometimes', Rule::in(['todo', 'doing', 'done'])],
            'priority' => ['sometimes', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'due_date' => ['nullable', 'date_format:Y-m-d'],
            'assignee_id' => ['nullable', 'exists:users,id'],
            'ticket_id' => ['nullable', 'exists:tickets,id'],
        ]);
    }
}
