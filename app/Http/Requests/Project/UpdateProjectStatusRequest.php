<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['nullable', 'string', Rule::in(ProjectStatus::values())],
            'progress' => 'nullable|integer|min:0|max:100',
            'workflow_step' => 'nullable|string|max:255',
            'custom_timeline' => 'nullable|array',
            'completed_step_name' => 'nullable|string|max:255',
            'drive_link' => 'nullable|array',
            'drive_link.name' => 'nullable|string|max:255',
            'drive_link.drive_url' => 'nullable|string|max:1000',
            'drive_link.file_type' => 'nullable|string|max:50',
            'revert_step_name' => 'nullable|string|max:255',
            'revert_step_names' => 'nullable|array',
        ];
    }
}
