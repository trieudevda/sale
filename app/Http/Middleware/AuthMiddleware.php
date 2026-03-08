<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
//        dd(1);
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        if (Auth::user()->role !== \App\Enum\User\UserRole::ADMIN) {
            abort(403, __('admin.you_do_not_have_access'));
        }

        return $next($request);
    }
}
