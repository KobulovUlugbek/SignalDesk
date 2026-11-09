<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Customer::query()->withCount('tickets')->orderBy('company');
        if ($request->filled('q')) {
            $term = substr((string) $request->input('q'), 0, 100);
            $query->where(fn ($q) => $q->where('company', 'like', '%'.$term.'%')->orWhere('name', 'like', '%'.$term.'%'));
        }
        return response()->json(['data' => $query->get()]);
    }

    public function store(Request $request, ActivityLogger $logger): JsonResponse
    {
        $data = $this->validated($request);
        $customer = Customer::create($data);
        $logger->record('created', 'Kunde angelegt: '.$customer->company, 'customer', $customer->id);
        return response()->json(['data' => $customer], 201);
    }

    public function update(Request $request, Customer $customer, ActivityLogger $logger): JsonResponse
    {
        $customer->update($this->validated($request, $customer));
        $logger->record('updated', 'Kunde aktualisiert: '.$customer->company, 'customer', $customer->id);
        return response()->json(['data' => $customer]);
    }

    private function validated(Request $request, ?Customer $customer = null): array
    {
        $required = $customer ? 'sometimes' : 'required';
        return $request->validate([
            'name' => [$required, 'string', 'min:2', 'max:120'],
            'company' => [$required, 'string', 'min:2', 'max:160'],
            'email' => [$required, 'email', 'max:190', Rule::unique('customers', 'email')->ignore($customer?->id)],
            'plan' => ['sometimes', Rule::in(['Starter', 'Business', 'Enterprise'])],
            'status' => ['sometimes', Rule::in(['active', 'paused'])],
            'industry' => ['nullable', 'string', 'max:80'],
            'phone' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);
    }
}
