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

class Project extends Model
{
    use HasFactory, HasUuids, SoftDeletes, LogsActivity;

    protected $fillable = [
        'project_number',
        'name',
        'client_id',
        'wedding_organizer_id',
        'category_id',
        'package_id',
        'status',
        'progress',
        'event_date',
        'event_time',
        'end_date',
        'deadline',
        'location',
        'photographer_id',
        'editor_id',
        'supervisor_id',
        'price',
        'discount',
        'tax',
        'total_amount',
        'paid_amount',
        'payment_status',
        'thumbnail',
        'notes',
        'workflow_step',
        'custom_timeline',
    ];

    protected $casts = [
        'event_date' => 'date',
        'end_date' => 'date',
        'deadline' => 'date',
        'progress' => 'integer',
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
        'tax' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'custom_timeline' => 'array',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'status', 'progress', 'payment_status', 'workflow_step', 'total_amount'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class)->withTrashed();
    }

    public function weddingOrganizer(): BelongsTo
    {
        return $this->belongsTo(WeddingOrganizer::class, 'wedding_organizer_id')->withTrashed();
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }

    public function photographer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'photographer_id');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'editor_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function projectAddons(): HasMany
    {
        return $this->hasMany(ProjectAddon::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(ProjectSchedule::class)->orderBy('date');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class)->orderBy('payment_date', 'desc');
    }

    public function fileLinks(): HasMany
    {
        return $this->hasMany(FileLink::class);
    }

    public function highlights(): HasMany
    {
        return $this->hasMany(ProjectHighlight::class)->orderBy('sort_order');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    public function promoSlides(): HasMany
    {
        return $this->hasMany(PromoSlide::class)->orderBy('sort_order');
    }
}

