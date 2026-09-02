<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'workflow_type',
        'status',
        'sort_order',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'slug', 'status'])
            ->logOnlyDirty();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function addons(): HasMany
    {
        return $this->hasMany(Addon::class);
    }
}
