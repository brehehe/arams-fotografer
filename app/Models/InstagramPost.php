<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class InstagramPost extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'image_url',
        'caption',
        'post_url',
        'likes_count',
        'comments_count',
        'media_type',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
