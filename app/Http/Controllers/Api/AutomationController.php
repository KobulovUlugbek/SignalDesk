<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Automation;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AutomationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => Automation::with('assignee:id,name')->latest()->get()]);
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $rule = Automation::create($this->validated($request));
        $logger->record('created', 'Automatisierung erstellt: '.$rule->name, 'automation', $rule->id);
        return response()->json(['data' => $rule->load('assignee')], 201);
    }

    public function update(Request $request, Automation $automation, ActivityLogger $logger): JsonResponse
    {
        $automation->update($this->validated($request, true));
        $logger->record('updated', 'Automatisierung geändert: '.$automation->name, 'automation', $automation->id);
        return response()->json(['data' => $automation->load('assignee')]);
    }

    public function destroy(Automation $automation, ActivityLogger $logger): JsonResponse
    {
        $logger->record('deleted', 'Automatisierung gelöscht: '.$automation->name, 'automation', $automation->id);
        $automation->delete();
        return response()->json(['ok' => true]);
    }

    private function validated(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';
        return $request->validate([
            'name' => [$required, 'string', 'min:3', 'max:140'],
            'trigger' => ['sometimes', Rule::in(['ticket_created'])],
            'condition_priority' => ['sometimes', Rule::in(['any', 'low', 'medium', 'high', 'urgent'])],
            'action' => ['sometimes', Rule::in(['set_in_progress', 'assign_agent'])],
            'assignee_id' => ['nullable', 'exists:users,id', Rule::requiredIf($request->input('action') === 'assign_agent')],
            'enabled' => ['sometimes', 'boolean'],
        ]);
    }
}
