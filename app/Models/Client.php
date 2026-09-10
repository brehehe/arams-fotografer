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

class Client extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'partner_name',
        'child_name',
        'child_birth_date',
        'child_gender',
        'father_name',
        'mother_name',
        'children',
        'bride_name',
        'bride_nickname',
        'groom_name',
        'groom_nickname',
        'bride_birth_date',
        'groom_birth_date',
        'company_name',
        'client_type',
        'email',
        'instagram',
        'phone',
        'secondary_phone',
        'preferred_contact',
        'province',
        'city',
        'district',
        'village',
        'postal_code',
        'province_code',
        'city_code',
        'district_code',
        'village_code',
        'address',
        'source',
        'client_source_id',
        'referred_by_client_id',
        'wedding_organizer_id',
        'referral_name',
        'status',
        'notes',
        'tags',
        'avatar',
    ];

    protected $casts = [
        'tags' => 'array',
        'children' => 'array',
        'bride_birth_date' => 'date',
        'groom_birth_date' => 'date',
        'child_birth_date' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'city', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function clientSource(): BelongsTo
    {
        return $this->belongsTo(ClientSource::class, 'client_source_id');
    }

    public function referredByClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'referred_by_client_id');
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Client::class, 'referred_by_client_id');
    }

    public function weddingOrganizer(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(WeddingOrganizer::class, 'wedding_organizer_id');
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(User::class, 'client_id');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
