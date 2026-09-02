<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class WeddingOrganizer extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'pic_name',
        'phone',
        'secondary_phone',
        'email',
        'instagram',
        'city',
        'address',
        'commission_rate',
        'tier',
        'status',
        'notes',
        'avatar',
        'bank_name',
        'bank_account_number',
        'bank_account_holder',
    ];

    protected $casts = [
        'commission_rate' => 'decimal:2',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'pic_name', 'phone', 'city', 'status', 'tier', 'commission_rate'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'wedding_organizer_id');
    }
}
