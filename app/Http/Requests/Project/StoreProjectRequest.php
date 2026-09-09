<?php

namespace App\Http\Requests\Project;

use App\Enums\ProjectStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProjectRequest extends FormRequest
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
            'workflow_type' => 'nullable|string',
            'status' => ['nullable', 'string'],
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:100',
            'end_date' => 'nullable|date',
            'deadline' => 'nullable|date',
            'created_at_date' => 'nullable|date',
            'location' => 'nullable|string',
            'photographer_id' => 'nullable|exists:users,id',
            'photographer_name' => 'nullable|string|max:255',
            'editor_id' => 'nullable|exists:users,id',
            'editor_name' => 'nullable|string|max:255',
            'supervisor_id' => 'nullable|exists:users,id',
            'price' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
            'thumbnail' => 'nullable|string',
            'dp_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'payment_status' => 'nullable|string',
            'payment_schema' => 'nullable|string',
            'invoice_type' => 'nullable|string',
            'invoice_amount' => 'nullable|numeric|min:0',
            'invoice_due_date' => 'nullable|date',
            'send_whatsapp' => 'nullable|boolean',
            'send_email_1' => 'nullable|boolean',
            'send_email_2' => 'nullable|boolean',
            'client_message' => 'nullable|string',
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
            // Client info overrides (wedding/newborn)
            'client_overrides' => 'nullable|array',
            'client_overrides.bride_name' => 'nullable|string|max:255',
            'client_overrides.bride_nickname' => 'nullable|string|max:255',
            'client_overrides.groom_name' => 'nullable|string|max:255',
            'client_overrides.groom_nickname' => 'nullable|string|max:255',
            'client_overrides.father_name' => 'nullable|string|max:255',
            'client_overrides.mother_name' => 'nullable|string|max:255',
            'client_overrides.child_name' => 'nullable|string|max:255',
            'client_overrides.child_birth_date' => 'nullable|date',
            'client_overrides.child_gender' => 'nullable|string|max:10',
            'client_overrides.children' => 'nullable|array',
            'client_overrides.children.*.name' => 'nullable|string|max:255',
            'client_overrides.children.*.nickname' => 'nullable|string|max:255',
            'client_overrides.children.*.birth_date' => 'nullable|date',
            'client_overrides.children.*.gender' => 'nullable|string|max:10',
        ];
    }
}
