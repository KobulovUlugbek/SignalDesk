<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('write') ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'subject' => ['required', 'string', 'min:5', 'max:160'],
            'description' => ['required', 'string', 'min:10', 'max:5000'],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'urgent'])],
            'channel' => ['sometimes', Rule::in(['portal', 'email', 'phone', 'chat'])],
            'category' => ['sometimes', Rule::in(['technical', 'billing', 'account', 'feature'])],
            'assignee_id' => ['nullable', 'integer', 'exists:users,id'],
        ];
    }
}
