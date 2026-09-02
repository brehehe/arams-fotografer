<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Package extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'category_id',
        'name',
        'description',
        'base_price',
        'duration_hours',
        'included_services',
        'included_deliverables',
        'status',
        'sort_order',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'duration_hours' => 'integer',
        'included_services' => 'array',
        'included_deliverables' => 'array',
        'sort_order' => 'integer',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'base_price', 'status'])
            ->logOnlyDirty();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }
}
