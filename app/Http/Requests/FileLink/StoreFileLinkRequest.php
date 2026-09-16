<?php

namespace App\Http\Requests\FileLink;

use Illuminate\Foundation\Http\FormRequest;

class StoreFileLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if (!$this->filled('project_id') && $this->route('project')) {
            $project = $this->route('project');
            $merge['project_id'] = is_object($project) ? $project->id : $project;
        }

        if ($this->filled('drive_url')) {
            $url = trim($this->input('drive_url'));
            if ($url !== '' && !preg_match('~^(?:f|ht)tps?://~i', $url)) {
                $merge['drive_url'] = 'https://' . $url;
            }
        }

        if (!empty($merge)) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        return [
            'project_id' => 'sometimes|required|exists:projects,id',
            'name' => 'required|string|max:255',
            'drive_url' => 'required|url|max:500',
            'file_type' => 'required|string',
            'expires_at' => 'nullable|date',
            'expiry_days' => 'nullable|integer|min:0',
        ];
    }
}
