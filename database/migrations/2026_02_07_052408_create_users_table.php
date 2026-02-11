<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('full_name')->nullable();
            $table->string('email')->unique();
            $table->string('avatar')->nullable();
            $table->string('nickname')->nullable();
            $table->string('address')->nullable();
            $table->string('phone',20)->nullable();
            $table->string('signin_type')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('role')->default(\App\Enum\User\UserRole::ADMIN);
            $table->string('remember_token', 100)->nullable();
            $table->string('status')->default(\App\Enum\User\UserStatus::ACTIVE);
            $table->string('last_login_at')->default(\Carbon\Carbon::now());
            $table->timestamps();
        });
    //     if (auth()->check() && auth()->user()->status === 'banned') {
    //     auth()->logout();
    //     return redirect()->route('login')->with('error', 'Tài khoản của bạn đã bị khóa!');
    // }cls
//         Active: bg-green-100 text-green-800 (Xanh lá)
// Pending: bg-yellow-100 text-yellow-800 (Vàng)
// Banned: bg-red-100 text-red-800 (Đỏ)
// Inactive: bg-gray-100 text-gray-800 (Xám)

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
