<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        $project = $this->route('project');
        return $project ? $this->user()?->can('update', $project) : false;
    }

    public function rules(): array
    {
        return [
            'notes' => ['nullable', 'string', 'max:10000'],
            'title' => ['nullable', 'string', 'max:150'],
            'content' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
