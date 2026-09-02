<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class ClientSource extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'type',
        'phone',
        'email',
        'description',
        'status',
        'is_primary',
        'avatar',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'phone', 'status', 'is_primary'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function appreciations(): HasMany
    {
        return $this->hasMany(ClientSourceAppreciation::class, 'client_source_id')->latest('date');
    }
}
