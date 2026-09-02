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
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function clientSource(): BelongsTo
    {
        return $this->belongsTo(ClientSource::class, 'client_source_id');
    }
}
