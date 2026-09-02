<?php

namespace App\Services;

use Exception;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebpService
{
    protected mixed $imageResource = null;
    protected int $quality = 80;
    protected int $width = 0;
    protected int $height = 0;
    protected string $mimeType = '';

    /**
     * Create a new WebpService instance.
     */
    public static function make(UploadedFile|string $file): self
    {
        $instance = new self();
        $instance->loadImage($file);

        return $instance;
    }

    /**
     * Load image from UploadedFile, file path, or binary string.
     */
    public function loadImage(UploadedFile|string $file): self
    {
        if ($file instanceof UploadedFile) {
            $path = $file->getRealPath();
            $data = file_get_contents($path);
        } elseif (is_string($file) && file_exists($file)) {
            $path = $file;
            $data = file_get_contents($file);
        } elseif (is_string($file)) {
            $path = null;
            $data = $file;
        } else {
            throw new Exception('Invalid image input provided to WebpService.');
        }

        if (empty($data)) {
            throw new Exception('Image data is empty or unreadable.');
        }

        $image = @imagecreatefromstring($data);
        if (! $image) {
            throw new Exception('Unable to decode image data using GD.');
        }

        // Auto-orient image based on EXIF (for DSLR/Mobile photoshoot uploads)
        if (isset($path) && function_exists('exif_read_data')) {
            $exif = @exif_read_data($path);
            if (! empty($exif['Orientation'])) {
                switch ($exif['Orientation']) {
                    case 3:
                        $image = imagerotate($image, 180, 0);
                        break;
                    case 6:
                        $image = imagerotate($image, -90, 0);
                        break;
                    case 8:
                        $image = imagerotate($image, 90, 0);
                        break;
                }
            }
        }

        // Preserve alpha transparency
        imagepalettetotruecolor($image);
        imagealphablending($image, false);
        imagesavealpha($image, true);

        $this->imageResource = $image;
        $this->width = imagesx($image);
        $this->height = imagesy($image);

        return $this;
    }

    /**
     * Set WebP compression quality (1-100, default: 80).
     */
    public function quality(int $quality): self
    {
        $this->quality = max(1, min(100, $quality));

        return $this;
    }

    /**
     * Proportionally resize image within max dimensions.
     */
    public function resize(?int $maxWidth = null, ?int $maxHeight = null): self
    {
        if (! $this->imageResource || (! $maxWidth && ! $maxHeight)) {
            return $this;
        }

        $origWidth = $this->width;
        $origHeight = $this->height;

        $targetWidth = $origWidth;
        $targetHeight = $origHeight;

        if ($maxWidth && $targetWidth > $maxWidth) {
            $targetHeight = (int) round(($maxWidth / $targetWidth) * $targetHeight);
            $targetWidth = $maxWidth;
        }

        if ($maxHeight && $targetHeight > $maxHeight) {
            $targetWidth = (int) round(($maxHeight / $targetHeight) * $targetWidth);
            $targetHeight = $maxHeight;
        }

        if ($targetWidth === $origWidth && $targetHeight === $origHeight) {
            return $this;
        }

        $resized = imagecreatetruecolor($targetWidth, $targetHeight);
        imagealphablending($resized, false);
        imagesavealpha($resized, true);

        imagecopyresampled(
            $resized,
            $this->imageResource,
            0, 0, 0, 0,
            $targetWidth, $targetHeight,
            $origWidth, $origHeight
        );

        imagedestroy($this->imageResource);
        $this->imageResource = $resized;
        $this->width = $targetWidth;
        $this->height = $targetHeight;

        return $this;
    }

    /**
     * Crop image to an exact square or fixed dimension.
     */
    public function crop(int $width, int $height): self
    {
        if (! $this->imageResource) {
            return $this;
        }

        $origWidth = $this->width;
        $origHeight = $this->height;

        $srcX = 0;
        $srcY = 0;
        $srcW = $origWidth;
        $srcH = $origHeight;

        $ratio = $width / $height;
        $origRatio = $origWidth / $origHeight;

        if ($origRatio > $ratio) {
            $srcW = (int) round($origHeight * $ratio);
            $srcX = (int) round(($origWidth - $srcW) / 2);
        } else {
            $srcH = (int) round($origWidth / $ratio);
            $srcY = (int) round(($origHeight - $srcH) / 2);
        }

        $cropped = imagecreatetruecolor($width, $height);
        imagealphablending($cropped, false);
        imagesavealpha($cropped, true);

        imagecopyresampled(
            $cropped,
            $this->imageResource,
            0, 0, $srcX, $srcY,
            $width, $height,
            $srcW, $srcH
        );

        imagedestroy($this->imageResource);
        $this->imageResource = $cropped;
        $this->width = $width;
        $this->height = $height;

        return $this;
    }

    /**
     * Get the raw WebP binary blob.
     */
    public function toBlob(): string
    {
        if (! $this->imageResource) {
            throw new Exception('No image resource available to convert to WebP.');
        }

        ob_start();
        imagewebp($this->imageResource, null, $this->quality);
        $blob = ob_get_clean();

        return $blob ?: '';
    }

    /**
     * Store converted WebP directly to Laravel Storage disk.
     * Returns the public path (e.g., '/storage/projects/uuid.webp').
     */
    public function store(string $directory = 'uploads', string $disk = 'public', ?string $customFilename = null): string
    {
        $filename = $customFilename
            ? (Str::finish($customFilename, '.webp'))
            : (Str::random(40).'.webp');

        $path = trim($directory, '/').'/'.$filename;
        $blob = $this->toBlob();

        Storage::disk($disk)->put($path, $blob);

        return $disk === 'public' ? '/storage/'.$path : $path;
    }

    /**
     * Helper to safely remove an old image from Storage when replacing.
     */
    public static function deleteOldImage(?string $urlOrPath, string $disk = 'public'): bool
    {
        if (empty($urlOrPath)) {
            return false;
        }

        // Strip '/storage/' prefix if present
        $cleanPath = preg_replace('/^\/?storage\//', '', $urlOrPath);

        if (Storage::disk($disk)->exists($cleanPath)) {
            return Storage::disk($disk)->delete($cleanPath);
        }

        return false;
    }

    /**
     * Destroy GD image resource on destruct.
     */
    public function __destruct()
    {
        if ($this->imageResource && is_resource($this->imageResource)) {
            imagedestroy($this->imageResource);
        }
    }
}
