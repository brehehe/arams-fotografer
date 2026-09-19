<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkflowRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Super Admin', 'Owner', 'Admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string'],
            'steps' => ['required', 'array', 'min:1'],
            'steps.*.name' => ['required', 'string', 'max:255'],
            'steps.*.phase' => ['nullable', 'string', 'max:100'],
            'steps.*.duration' => ['nullable', 'string', 'max:100'],
            'steps.*.activity' => ['nullable', 'string'],
        ];
    }
}
