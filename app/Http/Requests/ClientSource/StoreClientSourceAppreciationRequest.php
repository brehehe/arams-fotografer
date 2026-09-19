<?php

namespace App\Http\Requests\ClientSource;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientSourceAppreciationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', 'in:given,pending'],
            'date' => ['required', 'date'],
            'type' => ['required', 'string', 'max:255'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method_id' => ['nullable', 'uuid', 'exists:payment_methods,id'],
            'is_recorded_in_finance' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
            'proof_image' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],
        ];
    }
}
