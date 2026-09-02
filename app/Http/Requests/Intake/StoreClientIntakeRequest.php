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
            'bride_name' => 'nullable|string|max:255',
            'bride_nickname' => 'nullable|string|max:100',
            'groom_name' => 'nullable|string|max:255',
            'groom_nickname' => 'nullable|string|max:100',
            'bride_birth_date' => 'nullable|date',
            'groom_birth_date' => 'nullable|date',
            'phone' => 'required|string|max:50',
            'secondary_phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'instagram' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'category_id' => 'required',
            'package_id' => 'nullable',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:100',
            'location' => 'nullable|string|max:255',
            'reception_location' => 'nullable|string|max:255',
            'estimated_guests' => 'nullable|string|max:100',
            'event_type' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'referred_by_client_id' => 'nullable',
            'wedding_organizer_id' => 'nullable',
            'referral_name' => 'nullable|string|max:255',
            'source_info' => 'nullable|string|max:255',
            'concept_theme' => 'nullable|string',
            'favorite_style' => 'nullable|string',
            'reference_url' => 'nullable|string',
            'has_reference' => 'nullable|string',
            'communication_preference' => 'nullable|string',
            'best_contact_time' => 'nullable|string',
        ];
    }
}
