<?php

namespace App\Http\Requests\FileLink;

use Illuminate\Foundation\Http\FormRequest;

class ExtendFileLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expires_at' => 'nullable|date',
            'extend_days' => 'nullable|integer|min:1',
        ];
    }
}
