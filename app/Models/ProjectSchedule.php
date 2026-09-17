<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectSchedule extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'project_id',
        'title',
        'date',
        'start_time',
        'end_time',
        'location',
        'type',
        'status',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Mutator to ensure start_time is valid PostgreSQL TIME format.
     */
    public function setStartTimeAttribute($value): void
    {
        $this->attributes['start_time'] = self::normalizeTime($value);
    }

    /**
     * Mutator to ensure end_time is valid PostgreSQL TIME format.
     */
    public function setEndTimeAttribute($value): void
    {
        $this->attributes['end_time'] = self::normalizeTime($value);
    }

    /**
     * Normalize time strings (e.g., "10.00", "10:00", "10.00 WIB", "09:30:00") into valid PostgreSQL TIME (HH:MM:SS) format.
     */
    public static function normalizeTime($value): ?string
    {
        if (empty($value) || !is_string($value)) {
            return null;
        }

        $value = trim($value);

        // Match HH:MM or HH.MM with optional seconds: e.g. 10:00, 10.00, 09:30:00, 9.30
        if (preg_match('/\b(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?\b/', $value, $matches)) {
            $h = (int) $matches[1];
            $m = (int) $matches[2];
            $s = isset($matches[3]) ? (int) $matches[3] : 0;
            if ($h >= 0 && $h <= 23 && $m >= 0 && $m <= 59 && $s >= 0 && $s <= 59) {
                return sprintf('%02d:%02d:%02d', $h, $m, $s);
            }
        }

        // Single hour format: e.g. "10" or "Jam 10"
        if (preg_match('/\b(\d{1,2})\b/', $value, $matches)) {
            $h = (int) $matches[1];
            if ($h >= 0 && $h <= 23) {
                return sprintf('%02d:00:00', $h);
            }
        }

        return null;
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
