<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class BackupService
{
    protected string $disk = 'local';
    protected string $backupFolder = 'Arams-Photography';

    /**
     * Get list of real backup archive files from storage.
     *
     * @return array<int, array{
     *     filename: string,
     *     size: string,
     *     raw_size: int,
     *     created_at: string,
     *     timestamp: int,
     *     download_url: string
     * }>
     */
    public function getBackupsList(): array
    {
        $storage = Storage::disk($this->disk);

        if (! $storage->exists($this->backupFolder)) {
            return [];
        }

        $files = $storage->files($this->backupFolder);
        $backups = [];

        foreach ($files as $file) {
            if (! str_ends_with(strtolower($file), '.zip')) {
                continue;
            }

            $size = $storage->size($file);
            $lastModified = $storage->lastModified($file);
            $filename = basename($file);

            $backups[] = [
                'filename' => $filename,
                'size' => $this->formatBytes($size),
                'raw_size' => $size,
                'created_at' => Carbon::createFromTimestamp($lastModified)->setTimezone(config('app.timezone', 'Asia/Jakarta'))->locale('id')->translatedFormat('d M Y, H:i') . ' WIB',
                'timestamp' => $lastModified,
                'download_url' => route('settings.backup.download', ['filename' => $filename]),
            ];
        }

        // Urutkan dari yang paling baru
        usort($backups, fn ($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        return $backups;
    }

    /**
     * Run Spatie backup command (full: db + storage, or db: database only).
     */
    public function runBackup(string $type = 'full', $causer = null): array
    {
        $params = ['--disable-notifications' => true];

        if ($type === 'db') {
            $params['--only-db'] = true;
        }

        $exitCode = Artisan::call('backup:run', $params);
        $output = Artisan::output();

        $success = ($exitCode === 0);
        $typeName = $type === 'db' ? 'Database Saja' : 'Lengkap (Database + Storage)';

        if ($success) {
            activity()
                ->causedBy($causer ?? auth()->user())
                ->event('backup_created')
                ->log("Backup sistem [{$typeName}] berhasil dibuat via Spatie Backup");
        } else {
            activity()
                ->causedBy($causer ?? auth()->user())
                ->event('backup_failed')
                ->log("Gagal membuat backup sistem [{$typeName}]: " . substr($output, 0, 200));
        }

        return [
            'success' => $success,
            'message' => $success
                ? "Backup {$typeName} berhasil dibuat."
                : "Gagal membuat backup: " . trim($output),
            'output' => $output,
        ];
    }

    /**
     * Download backup file securely.
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        $safeFilename = basename($filename);

        if (! str_ends_with(strtolower($safeFilename), '.zip')) {
            abort(404, 'File backup tidak valid.');
        }

        $filePath = "{$this->backupFolder}/{$safeFilename}";
        $storage = Storage::disk($this->disk);

        if (! $storage->exists($filePath)) {
            abort(404, 'File arsip backup tidak ditemukan.');
        }

        activity()
            ->causedBy(auth()->user())
            ->event('backup_downloaded')
            ->log("File backup {$safeFilename} diunduh");

        $fullPath = $storage->path($filePath);

        return response()->download($fullPath, $safeFilename, [
            'Content-Type' => 'application/zip',
        ]);
    }

    /**
     * Delete backup archive file.
     */
    public function deleteBackup(string $filename, $causer = null): bool
    {
        $safeFilename = basename($filename);

        if (! str_ends_with(strtolower($safeFilename), '.zip')) {
            return false;
        }

        $filePath = "{$this->backupFolder}/{$safeFilename}";
        $storage = Storage::disk($this->disk);

        if (! $storage->exists($filePath)) {
            return false;
        }

        $deleted = $storage->delete($filePath);

        if ($deleted) {
            activity()
                ->causedBy($causer ?? auth()->user())
                ->event('backup_deleted')
                ->log("File backup {$safeFilename} dihapus");
        }

        return $deleted;
    }

    /**
     * Format bytes to human readable format.
     */
    protected function formatBytes(int $bytes, int $precision = 2): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $base = log($bytes, 1024);
        $pow = min((int) floor($base), count($units) - 1);

        return round(pow(1024, $base - $pow), $precision) . ' ' . $units[$pow];
    }
}
