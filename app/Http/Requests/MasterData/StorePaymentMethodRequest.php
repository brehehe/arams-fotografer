<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:payment_methods,code',
            'account_number' => 'nullable|string|max:100',
            'account_holder' => 'nullable|string|max:255',
            'icon' => 'nullable|string|max:50',
            'status' => 'required|string|in:active,inactive',
        ];
    }
}
