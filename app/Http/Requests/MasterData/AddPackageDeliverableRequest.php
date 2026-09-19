<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class AddPackageDeliverableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Super Admin', 'Owner', 'Admin']) ?? false;
    }

    public function rules(): array
    {
        return [
            'name'            => ['required', 'string', 'max:255'],
            'type'            => ['required', 'string', 'in:Photo,Video,Album,Special'],
            'target_deadline' => ['nullable', 'string', 'max:50'],
            'description'     => ['nullable', 'string'],
            'is_required'     => ['nullable', 'boolean'],
            'by_owner'        => ['nullable', 'boolean'],
        ];
    }
}
