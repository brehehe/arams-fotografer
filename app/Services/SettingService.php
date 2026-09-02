<?php

namespace App\Services;

use App\Models\Setting;
use App\Models\User;
use App\Traits\HasWebpUpload;
use Illuminate\Http\UploadedFile;

class SettingService
{
    use HasWebpUpload;

    /**
     * Get all settings grouped and key-value mapped.
     */
    public function getSettingsData(): array
    {
        $settings = Setting::all();
        $settingsGrouped = $settings->groupBy('group');
        $allSettings = $settings->pluck('value', 'key');

        return [
            'settings' => $settingsGrouped,
            'settingsMap' => $allSettings,
        ];
    }

    /**
     * Update settings and upload company logo converted to WebP.
     */
    public function updateSettings(array $settings, ?UploadedFile $logoFile = null, ?User $causer = null): void
    {
        if ($logoFile) {
            $oldLogo = Setting::get('company_logo');
            $settings['company_logo'] = $this->uploadAsWebp(
                $logoFile,
                'logos',
                quality: 85,
                maxWidth: 600,
                oldPath: $oldLogo
            );
        }

        foreach ($settings as $key => $val) {
            Setting::set($key, $val);
        }

        if (isset($settings['link_expiry_days'])) {
            $days = (int) $settings['link_expiry_days'];
            if ($days > 0) {
                foreach (\App\Models\FileLink::all() as $file) {
                    if ($file->created_at) {
                        $file->expires_at = $file->created_at->copy()->addDays($days);
                        $file->save();
                    }
                }
            }
        }

        activity()
            ->causedBy($causer ?? auth()->user())
            ->event('settings_updated')
            ->log('Pengaturan sistem dan logo perusahaan diperbarui');
    }
}
