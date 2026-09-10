<?php

namespace App\Http\Requests\Client;

use App\Enums\ClientStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isPartial = $this->isMethod('patch') || $this->isMethod('put');

        return [
            'name' => $isPartial ? 'sometimes|required|string|max:255' : 'required|string|max:255',
            'partner_name' => 'nullable|string|max:255',
            'child_name' => 'nullable|string|max:255',
            'child_birth_date' => 'nullable|date',
            'child_gender' => 'nullable|string|max:50',
            'father_name' => 'nullable|string|max:255',
            'mother_name' => 'nullable|string|max:255',
            'children' => 'nullable|array',
            'children.*.name' => 'nullable|string|max:255',
            'children.*.nickname' => 'nullable|string|max:100',
            'children.*.birth_date' => 'nullable|date',
            'children.*.gender' => 'nullable|string|max:50',
            'bride_name' => 'nullable|string|max:255',
            'bride_nickname' => 'nullable|string|max:100',
            'groom_name' => 'nullable|string|max:255',
            'groom_nickname' => 'nullable|string|max:100',
            'bride_birth_date' => 'nullable|date',
            'groom_birth_date' => 'nullable|date',
            'company_name' => 'nullable|string|max:255',
            'client_type' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'instagram' => 'nullable|string|max:100',
            'phone' => $isPartial ? 'sometimes|required|string|max:50' : 'required|string|max:50',
            'secondary_phone' => 'nullable|string|max:50',
            'preferred_contact' => 'nullable|string|in:whatsapp,email,phone',
            'contact_person' => 'nullable|string|max:255',
            'occupation' => 'nullable|string|max:255',
            'other_social_media' => 'nullable|string|max:255',
            'province' => 'nullable|string|max:100',
            'city' => 'nullable|string|max:100',
            'district' => 'nullable|string|max:100',
            'village' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'province_code' => 'nullable|string|max:20',
            'city_code' => 'nullable|string|max:20',
            'district_code' => 'nullable|string|max:20',
            'village_code' => 'nullable|string|max:30',
            'address' => 'nullable|string',
            'source' => 'nullable|string|max:100',
            'client_source_id' => 'nullable|exists:client_sources,id',
            'referred_by_client_id' => 'nullable|exists:clients,id',
            'wedding_organizer_id' => 'nullable|exists:wedding_organizers,id',
            'referral_name' => 'nullable|string|max:255',
            'event_type' => 'nullable|string|max:100',
            'event_date' => 'nullable|date',
            'event_time' => 'nullable|string|max:50',
            'event_location' => 'nullable|string|max:255',
            'package_id' => 'nullable|string|max:100',
            'status' => [$isPartial ? 'sometimes' : 'required', 'string', Rule::in(ClientStatus::values())],
            'notes' => 'nullable|string',
            'tags' => 'nullable|array',
        ];
    }
}
