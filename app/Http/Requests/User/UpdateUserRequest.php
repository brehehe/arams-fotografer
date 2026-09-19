<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $userId],
            'phone' => ['nullable', 'string', 'max:50'],
            'role' => [
                'required',
                'exists:roles,name',
                function ($attribute, $value, $fail) {
                    if (strtolower((string) $value) === 'client') {
                        $fail('Role Client tidak dapat ditugaskan melalui manajemen pengguna internal.');
                    }
                },
            ],
            'status' => ['required', 'string', 'in:active,inactive,suspended'],
            'password' => ['nullable', 'string', 'min:8'],
        ];
    }
}
