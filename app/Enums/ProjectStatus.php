<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case DRAFT = 'draft';
    case IN_PROGRESS = 'in_progress';
    case EDITING = 'editing';
    case PENDING = 'pending';
    case ON_HOLD = 'on_hold';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft / Pengajuan',
            self::IN_PROGRESS => 'Sedang Berlangsung',
            self::EDITING => 'Proses Editing',
            self::PENDING => 'Menunggu Pembayaran',
            self::ON_HOLD => 'Ditunda / On Hold',
            self::COMPLETED => 'Selesai',
            self::CANCELLED => 'Dibatalkan',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
