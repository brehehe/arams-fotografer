<?php

namespace App\Enums;

enum WeddingOrganizerStatus: string
{
    case ACTIVE = 'active';
    case PARTNER = 'partner';
    case LEAD = 'lead';
    case INACTIVE = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::ACTIVE => 'Aktif',
            self::PARTNER => 'Partner Resmi',
            self::LEAD => 'Prospek',
            self::INACTIVE => 'Nonaktif',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
