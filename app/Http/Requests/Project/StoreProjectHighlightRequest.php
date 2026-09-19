<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectHighlightRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'caption' => ['nullable', 'string'],
            'image_url' => ['nullable', 'string'],
            'image_file' => ['nullable', 'image', 'max:10240'],
            'media_type' => ['nullable', 'string', 'in:photo,video'],
            'is_cover' => ['boolean'],
            'sort_order' => ['integer'],
        ];
    }
}
