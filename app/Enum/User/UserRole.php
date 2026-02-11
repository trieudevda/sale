<?php

namespace App\Enum\User;

enum UserRole: string
{
    case ADMIN  = 'admin';
    case USER   = 'user';
}
