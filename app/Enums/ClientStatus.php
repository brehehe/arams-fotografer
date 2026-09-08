<?php

namespace App\Enums;

enum ClientStatus: string
{
    case ACTIVE = 'active';
    case COMPLETED = 'completed';
    case LEAD = 'lead';
    case BLOCKED = 'blocked';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::COMPLETED => 'Selesai',
            self::LEAD => 'Prospek / Lead',
            self::BLOCKED => 'Diblokir',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
