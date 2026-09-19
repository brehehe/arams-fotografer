<?php

namespace App\Http\Requests\Client;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('client')) ?? false;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
            'username' => ['nullable', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:6'],
            'send_method' => ['nullable', 'in:email,whatsapp,both'],
            'message' => ['nullable', 'string'],
        ];
    }
}
