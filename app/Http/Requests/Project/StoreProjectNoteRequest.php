<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        return $project ? $this->user()?->can('addNote', $project) : false;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:150'],
            'content' => ['required', 'string', 'max:5000'],
        ];
    }
}
