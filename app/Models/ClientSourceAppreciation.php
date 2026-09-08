<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ClientSourceAppreciation extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'client_source_id',
        'status',
        'date',
        'type',
        'amount',
        'payment_method_id',
        'finance_reference',
        'is_recorded_in_finance',
        'notes',
        'proof_image',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'is_recorded_in_finance' => 'boolean',
    ];

    public function clientSource(): BelongsTo
    {
        return $this->belongsTo(ClientSource::class, 'client_source_id');
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }
}
