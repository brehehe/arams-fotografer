<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FileLink extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'project_id',
        'name',
        'file_path',
        'drive_url',
        'file_type',
        'size',
        'expires_at',
        'is_hidden',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_hidden' => 'boolean',
    ];

    protected $appends = [
        'status',
        'days_remaining',
        'is_expired',
        'sent_at',
        'sender_name',
        'sender_role',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get computed status for the file link.
     */
    public function getStatusAttribute(): string
    {
        if ($this->is_hidden) {
            return 'disembunyikan';
        }

        if ($this->isExpired()) {
            return 'kedaluwarsa';
        }

        return 'terkirim';
    }

    /**
     * Get days remaining until expiration.
     */
    public function getDaysRemainingAttribute(): ?int
    {
        return $this->daysRemaining();
    }

    /**
     * Get is_expired boolean.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->isExpired();
    }

    /**
     * Get formatted sent at datetime.
     */
    public function getSentAtAttribute(): ?string
    {
        return $this->created_at ? $this->created_at->translatedFormat('d M Y, H:i') : null;
    }

    /**
     * Get sender user name.
     */
    public function getSenderNameAttribute(): string
    {
        return $this->creator?->name ?? 'Admin Arams';
    }

    /**
     * Get sender role.
     */
    public function getSenderRoleAttribute(): string
    {
        return $this->creator?->roles?->first()?->name ?? ($this->creator ? 'admin' : 'admin');
    }

    /**
     * Check if file link has expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    /**
     * Calculate days remaining until expiration.
     */
    public function daysRemaining(): ?int
    {
        if ($this->expires_at === null) {
            return null;
        }

        if ($this->isExpired()) {
            return 0;
        }

        return (int) ceil(Carbon::now()->diffInDays($this->expires_at, false));
    }

    /**
     * Scope for active (non-expired and non-hidden) file links visible to client.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_hidden', false)
            ->where(function (Builder $q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', Carbon::now());
            });
    }

    /**
     * Scope for expired file links.
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '<=', Carbon::now());
    }

    /**
     * Scope for file links expiring within given days.
     */
    public function scopeExpiringSoon(Builder $query, int $days = 7): Builder
    {
        return $query->whereNotNull('expires_at')
            ->where('expires_at', '>', Carbon::now())
            ->where('expires_at', '<=', Carbon::now()->addDays($days));
    }
}
