<?php

namespace App\Http\Requests\FileLink;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'name' => 'required|string|max:255',
            'drive_url' => 'required|url|max:500',
            'file_type' => 'required|string',
            'expires_at' => 'nullable|date',
            'expiry_days' => 'nullable|integer|min:0',
        ];
    }
}
