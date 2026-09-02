<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $pmId = $this->route('payment_method')?->id ?? $this->route('payment_method');

        return [
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('payment_methods', 'code')->ignore($pmId)],
            'account_number' => 'nullable|string|max:100',
            'account_holder' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|string|in:active,inactive',
        ];
    }
}
