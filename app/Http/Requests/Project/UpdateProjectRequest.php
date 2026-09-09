<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'wedding_organizer_id' => 'nullable|exists:wedding_organizers,id',
            'category_id' => 'required|exists:categories,id',
            'package_id' => 'nullable|exists:packages,id',
            'status' => ['required', 'string', Rule::in(ProjectStatus::values())],
            'progress' => 'nullable|integer|min:0|max:100',
            'workflow_step' => 'nullable|string',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:100',
            'end_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'location' => 'nullable|string',
            'photographer_id' => 'nullable|exists:users,id',
            'editor_id' => 'nullable|exists:users,id',
            'supervisor_id' => 'nullable|exists:users,id',
            'price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'thumbnail' => 'nullable|string',
            'notes' => 'nullable|string',
            'custom_timeline' => 'nullable|array',
            'category_data' => 'nullable|array',
            'selected_addons' => 'nullable|array',
            'selected_addons.*.id' => 'nullable|string',
            'selected_addons.*.name' => 'required_with:selected_addons|string|max:255',
            'selected_addons.*.is_custom' => 'nullable|boolean',
            'selected_addons.*.qty' => 'required_with:selected_addons|integer|min:1',
            'selected_addons.*.unit' => 'nullable|string|max:50',
            'selected_addons.*.unit_price' => 'required_with:selected_addons|numeric|min:0',
            'selected_addons.*.total_price' => 'required_with:selected_addons|numeric|min:0',
            'client_overrides' => 'nullable|array',
        ];
    }
}
