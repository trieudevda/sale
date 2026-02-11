<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class UserController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            // Chỉ bắt đăng nhập với các hàm: index, profile
            new Middleware('auth', only: ['index']),

            // HOẶC: Bắt đăng nhập tất cả TRỪ hàm: show, publicInfo
            // new Middleware('auth', except: ['show', 'publicInfo']),
        ];
    }

    public function index()
    {
        return 1;
    }

    public function register(Request $request)
    {
        if ($request->isMethod('post')) {
            if ($request->password != $request->password_confirmation) {
                return redirect()->back()->with('error', 'Password confirmation does not match');
            }
            if (User::where('email', $request->email)->exists()) {
                return redirect()->back()->with('error', 'Email already exists');
            }
            DB::beginTransaction();
            try {
                User::create([
                    'email' => $request->email,
                    'password' => $request->password,
                    'role' => \App\Enum\User\UserRole::ADMIN,
                ]);
                DB::commit();
                return redirect()->back()->with('success', 'User registered successfully');
            } catch (\Exception $e) {
                dd($e->getMessage());
                DB::rollBack();
                return redirect()->back()->with('error', 'Failed to register user');
            }
        }

        return view('admin.user.register');
    }

    public function login(Request $request)
    {
        if ($request->isMethod('post')) {
            // $loginField = filter_var($request->email, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
            $user = User::where('email', $request->email)->exists();
            if (! $user) {
                return redirect()->back()->with('error', 'Invalid email');
            }

            $credentials = [
                'email' => $request->email,
                'password' => $request->password,
                'status' => \App\Enum\User\UserStatus::ACTIVE,
                // 'role' => \App\Enum\User\UserRole::ADMIN,
            ];

            if (Auth::attempt($credentials)) {
                return redirect()->intended('/admin/blog')->with('success', 'Login successful');;
            }
            return redirect()->back()->with('error', 'Invalid email or password');
        }

        return view('admin.user.login');
    }
}
