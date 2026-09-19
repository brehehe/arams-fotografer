<?php

namespace App\Services;

use App\Models\FileLink;
use App\Models\Setting;
use App\Models\User;
use App\Traits\HasWebpUpload;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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
    public function updateSettings(
        array $settings,
        ?UploadedFile $logoFile = null,
        ?User $causer = null,
        ?UploadedFile $signatureFile = null,
        ?UploadedFile $loginBgFile = null
    ): void {
        DB::beginTransaction();

        try {
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

            // Handle login background photo from direct file upload or base64
            if ($loginBgFile) {
                $oldPhoto = Setting::get('login_bg_photo');
                $settings['login_bg_photo'] = $this->uploadAsWebp(
                    $loginBgFile,
                    'login',
                    quality: 85,
                    maxWidth: 1920,
                    oldPath: $oldPhoto && !str_starts_with($oldPhoto, 'data:image') ? $oldPhoto : null
                );
            } elseif (isset($settings['login_bg_photo']) && str_starts_with($settings['login_bg_photo'], 'data:image')) {
                $base64Photo = $settings['login_bg_photo'];
                $oldPhoto = Setting::get('login_bg_photo');

                $photoData = preg_replace('#^data:image/\w+;base64,#i', '', $base64Photo);
                $photoBinary = base64_decode($photoData);
                if ($photoBinary !== false) {
                    $tmpPhotoPath = tempnam(sys_get_temp_dir(), 'login_bg_') . '.png';
                    file_put_contents($tmpPhotoPath, $photoBinary);
                    try {
                        $bgPath = $this->uploadAsWebp(
                            $tmpPhotoPath,
                            'login',
                            quality: 85,
                            maxWidth: 1920,
                            oldPath: $oldPhoto && !str_starts_with($oldPhoto, 'data:image') ? $oldPhoto : null
                        );
                        $settings['login_bg_photo'] = $bgPath;
                    } finally {
                        if (file_exists($tmpPhotoPath)) {
                            @unlink($tmpPhotoPath);
                        }
                    }
                }
            } elseif (array_key_exists('login_bg_photo', $settings) && empty($settings['login_bg_photo'])) {
                $oldPhoto = Setting::get('login_bg_photo');
                if ($oldPhoto && !str_starts_with($oldPhoto, 'data:image')) {
                    $this->deleteWebpImage($oldPhoto, 'public');
                }
                $settings['login_bg_photo'] = '';
            }

            foreach ($settings as $key => $val) {
                Setting::set($key, $val);
            }

            if (isset($settings['link_expiry_days'])) {
                $days = (int) $settings['link_expiry_days'];
                if ($days > 0) {
                    $driver = DB::connection()->getDriverName();
                    if ($driver === 'pgsql') {
                        FileLink::whereNotNull('created_at')->update([
                            'expires_at' => DB::raw("created_at + interval '{$days} days'"),
                        ]);
                    } elseif ($driver === 'sqlite') {
                        FileLink::whereNotNull('created_at')->update([
                            'expires_at' => DB::raw("datetime(created_at, '+{$days} days')"),
                        ]);
                    } else {
                        FileLink::whereNotNull('created_at')->update([
                            'expires_at' => DB::raw("DATE_ADD(created_at, INTERVAL {$days} DAY)"),
                        ]);
                    }
                }
            }

            activity()
                ->causedBy($causer ?? auth()->user())
                ->event('settings_updated')
                ->log('Pengaturan sistem dan logo perusahaan diperbarui');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error("Failed to update settings: {$e->getMessage()}", ['exception' => $e]);
            throw $e;
        }
    }
}
