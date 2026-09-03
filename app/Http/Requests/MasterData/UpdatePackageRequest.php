<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'base_price' => 'required|numeric|min:0',
            'duration_hours' => 'required|integer|min:1',
            'included_services' => 'nullable|array',
            'included_deliverables' => 'nullable|array',
            'status' => 'required|string|in:active,inactive',
        ];
    }
}
