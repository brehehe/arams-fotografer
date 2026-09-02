<?php

namespace App\Traits;

use App\Services\WebpService;
use Illuminate\Http\UploadedFile;

trait HasWebpUpload
{
    /**
     * Upload an image file converted to WebP with optional resizing and old image deletion.
     *
     * @param  UploadedFile|string  $file
     * @param  string  $directory  Storage subfolder (e.g. 'logos', 'projects', 'avatars')
     * @param  int  $quality  Compression quality (1-100, default: 80)
     * @param  int|null  $maxWidth  Max width constraint (auto proportional scale)
     * @param  int|null  $maxHeight  Max height constraint (auto proportional scale)
     * @param  string|null  $oldPath  Existing image path/URL to automatically delete upon successful upload
     * @param  string  $disk  Storage disk (default: 'public')
     * @return string Public Storage URL (e.g. '/storage/projects/xyz.webp')
     */
    public function uploadAsWebp(
        UploadedFile|string $file,
        string $directory = 'uploads',
        int $quality = 80,
        ?int $maxWidth = 1920,
        ?int $maxHeight = null,
        ?string $oldPath = null,
        string $disk = 'public'
    ): string {
        $service = WebpService::make($file)->quality($quality);

        if ($maxWidth || $maxHeight) {
            $service->resize($maxWidth, $maxHeight);
        }

        $storedPath = $service->store($directory, $disk);

        if ($oldPath) {
            $this->deleteWebpImage($oldPath, $disk);
        }

        return $storedPath;
    }

    /**
     * Upload a square/cropped thumbnail converted to WebP.
     *
     * @param  UploadedFile|string  $file
     * @param  string  $directory  Storage subfolder (e.g. 'thumbnails', 'avatars')
     * @param  int  $width  Crop width (default: 400)
     * @param  int  $height  Crop height (default: 400)
     * @param  int  $quality  Compression quality (default: 80)
     * @param  string|null  $oldPath  Existing image path to delete
     * @param  string  $disk  Storage disk (default: 'public')
     * @return string Public Storage URL
     */
    public function uploadThumbnailAsWebp(
        UploadedFile|string $file,
        string $directory = 'thumbnails',
        int $width = 400,
        int $height = 400,
        int $quality = 80,
        ?string $oldPath = null,
        string $disk = 'public'
    ): string {
        $storedPath = WebpService::make($file)
            ->crop($width, $height)
            ->quality($quality)
            ->store($directory, $disk);

        if ($oldPath) {
            $this->deleteWebpImage($oldPath, $disk);
        }

        return $storedPath;
    }

    /**
     * Delete an existing WebP image from Storage disk.
     */
    public function deleteWebpImage(?string $urlOrPath, string $disk = 'public'): bool
    {
        return WebpService::deleteOldImage($urlOrPath, $disk);
    }
}
