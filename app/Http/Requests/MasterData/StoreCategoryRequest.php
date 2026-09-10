<?php

namespace App\Http\Requests\MasterData;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'image_url' => 'nullable|string',
            'image_file' => 'nullable|file|image|max:10240',
            'icon' => 'nullable|string|max:50',
            'color' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'workflow_type' => 'nullable|string|in:wedding,non_wedding,custom,photoshoot',
            'form_type' => 'nullable|string|max:50',
            'status' => 'required|string|in:active,inactive',
        ];
    }
}
