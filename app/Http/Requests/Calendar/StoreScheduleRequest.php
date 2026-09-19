<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['nullable', 'exists:projects,id'],
            'client_id'  => ['nullable', 'exists:clients,id'],
            'title'      => ['required', 'string', 'max:255'],
            'date'       => ['required', 'date'],
            'start_time' => ['nullable', 'string'],
            'end_time'   => ['nullable', 'string'],
            'location'   => ['nullable', 'string', 'max:255'],
            'type'       => ['nullable', 'string', 'max:50'],
            'status'     => ['nullable', 'string', 'max:50'],
            'notes'      => ['nullable', 'string'],
        ];
    }
}
