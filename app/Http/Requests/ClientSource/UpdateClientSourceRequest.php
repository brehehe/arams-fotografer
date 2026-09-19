<?php

namespace App\Http\Requests\ClientSource;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientSourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'string', 'in:individual,wedding_organizer,vendor,social_media,ads,other'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'is_primary' => ['required', 'boolean'],
        ];
    }
}
