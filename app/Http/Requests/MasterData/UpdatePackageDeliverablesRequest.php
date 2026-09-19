<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageDeliverablesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Super Admin', 'Owner', 'Admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'deliverables' => ['required', 'array'],
            'deliverables.*.name' => ['required', 'string', 'max:255'],
            'deliverables.*.type' => ['nullable', 'string'],
            'deliverables.*.deadline' => ['nullable', 'string'],
            'deliverables.*.description' => ['nullable', 'string'],
            'deliverables.*.required' => ['nullable', 'boolean'],
            'deliverables.*.by_owner' => ['nullable', 'boolean'],
        ];
    }
}
