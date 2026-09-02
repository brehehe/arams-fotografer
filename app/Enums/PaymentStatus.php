<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case PENDING = 'pending';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::PENDING => 'Menunggu Pembayaran',
            self::COMPLETED => 'Lunas / Berhasil',
            self::FAILED => 'Gagal',
            self::REFUNDED => 'Dikembalikan / Refund',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
