<?php

namespace App\Http\Requests\Intake;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientIntakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'child_name' => 'nullable|string|max:255',
            'child_nickname' => 'nullable|string|max:100',
            'child_birth_date' => 'nullable|date',
            'child_gender' => 'nullable|string|max:50',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'parent_names' => 'nullable|string|max:255',
            'children' => 'nullable|array',
            'children.*.name' => 'nullable|string|max:255',
            'children.*.nickname' => 'nullable|string|max:100',
            'children.*.birth_date' => 'nullable|date',
            'children.*.gender' => 'nullable|string|max:50',
            'bride_name' => 'nullable|string|max:255',
            'bride_nickname' => 'nullable|string|max:100',
            'bride_occupation' => 'nullable|string|max:255',
            'groom_name' => 'nullable|string|max:255',
            'groom_nickname' => 'nullable|string|max:100',
            'groom_occupation' => 'nullable|string|max:255',
            'bride_birth_date' => 'nullable|date',
            'groom_birth_date' => 'nullable|date',
            'bride_instagram' => 'nullable|string|max:100',
            'groom_instagram' => 'nullable|string|max:100',
            'primary_contact' => 'nullable|string|max:50',
            'phone' => 'required|string|max:50',
            'secondary_phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'instagram' => 'nullable|string|max:100',
            'other_social_media' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'province_code' => 'nullable|string|max:20',
            'city' => 'nullable|string|max:100',
            'city_code' => 'nullable|string|max:20',
            'district' => 'nullable|string|max:100',
            'district_code' => 'nullable|string|max:20',
            'village' => 'nullable|string|max:100',
            'village_code' => 'nullable|string|max:30',
            'postal_code' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'category_id' => 'nullable',
            'package_id' => 'nullable',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'reception_location' => 'nullable|string|max:255',
            'estimated_guests' => 'nullable|string|max:100',
            'event_type' => 'nullable|string|max:100',
            'concept_theme' => 'nullable|string|max:255',
            'other_vendors' => 'nullable|string',
            'project_notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'referred_by_client_id' => 'nullable',
            'wedding_organizer_id' => 'nullable',
            'client_source_id' => 'nullable|exists:client_sources,id',
            'referral_name' => 'nullable|string|max:255',
            'source_info' => 'nullable|string|max:255',
            'reference_url' => 'nullable|string',
            'special_requests' => 'nullable|string',
            'has_reference' => 'nullable|string',
            'communication_preference' => 'nullable|string',
            'best_contact_time' => 'nullable|string',
            'category_data' => 'nullable|array',
        ];
    }
}
