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
}
