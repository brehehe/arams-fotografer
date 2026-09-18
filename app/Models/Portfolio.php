<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Portfolio extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'portfolio_category_id',
        'title',
        'caption',
        'image_url',
        'media_type',
        'video_url',
        'is_active',
        'sort_order',
        'likes_count',
        'comments_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
    ];

    protected $appends = [
        'youtube_id',
        'youtube_embed_url',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(PortfolioCategory::class, 'portfolio_category_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeWithImage(Builder $query): Builder
    {
        return $query->whereNotNull('image_url')->where('image_url', '!=', '');
    }

    /**
     * Extract 11-character YouTube video ID from various URL formats.
     */
    public static function extractYoutubeId(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        // Match watch?v=, youtu.be/, embed/, shorts/, etc.
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i', $url, $matches)) {
            return $matches[1];
        }

        // If string is directly the 11-char ID
        if (preg_match('/^[a-zA-Z0-9_-]{11}$/', trim($url))) {
            return trim($url);
        }

        return null;
    }

    public function getYoutubeIdAttribute(): ?string
    {
        return self::extractYoutubeId($this->video_url);
    }

    public function getYoutubeEmbedUrlAttribute(): ?string
    {
        $id = $this->youtube_id;
        return $id ? "https://www.youtube-nocookie.com/embed/{$id}" : null;
    }

    public function getYoutubeThumbnailUrlAttribute(): ?string
    {
        $id = $this->youtube_id;
        return $id ? "https://img.youtube.com/vi/{$id}/hqdefault.jpg" : null;
    }
}
