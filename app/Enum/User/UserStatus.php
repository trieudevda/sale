<?php

namespace App\Enum\User;

enum UserStatus: string
{
    case ACTIVE = "active";
    case PENDING = 'pending';
    case DELETED = "deleted";
    case BLOCKED = "blocked";
}
