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
     * Update settings and upload company logo and signature converted to WebP.
     */
    public function updateSettings(array $settings, ?UploadedFile $logoFile = null, ?User $causer = null, ?UploadedFile $signatureFile = null): void
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

        // Handle signature image from direct file upload
        if ($signatureFile) {
            $oldSig = Setting::get('invoice_signature_image') ?: Setting::get('company_signature');
            $sigPath = $this->uploadAsWebp(
                $signatureFile,
                'signatures',
                quality: 90,
                maxWidth: 800,
                oldPath: $oldSig
            );
            $settings['invoice_signature_image'] = $sigPath;
            $settings['company_signature'] = $sigPath;
        } elseif (isset($settings['invoice_signature_image']) && str_starts_with($settings['invoice_signature_image'], 'data:image')) {
            // Handle signature image from base64 canvas drawing
            $base64Data = $settings['invoice_signature_image'];
            $oldSig = Setting::get('invoice_signature_image') ?: Setting::get('company_signature');

            $data = preg_replace('#^data:image/\w+;base64,#i', '', $base64Data);
            $binary = base64_decode($data);
            if ($binary !== false) {
                $tmpPath = tempnam(sys_get_temp_dir(), 'sig_') . '.png';
                file_put_contents($tmpPath, $binary);
                try {
                    $sigPath = $this->uploadAsWebp(
                        $tmpPath,
                        'signatures',
                        quality: 90,
                        maxWidth: 800,
                        oldPath: $oldSig
                    );
                    $settings['invoice_signature_image'] = $sigPath;
                    $settings['company_signature'] = $sigPath;
                } finally {
                    if (file_exists($tmpPath)) {
                        @unlink($tmpPath);
                    }
                }
            }
        } elseif (array_key_exists('invoice_signature_image', $settings) && empty($settings['invoice_signature_image'])) {
            $oldSig = Setting::get('invoice_signature_image') ?: Setting::get('company_signature');
            if ($oldSig) {
                $this->deleteWebpImage($oldSig, 'public');
            }
            $settings['invoice_signature_image'] = '';
            $settings['company_signature'] = '';
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
