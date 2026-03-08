<?php

namespace App\Enum\Category;

enum CategoryStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    public function label(): string
    {
        return match($this) {
            self::ACTIVE => 'Bật',
            self::INACTIVE => 'Tắt',
        };
    }
}
