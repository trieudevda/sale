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
        Schema::create('blogs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();   
            $table->longText('contents')->nullable();
            $table->foreignId('avatar_image_id')->nullable()->constrained('images');
            $table->foreignId('category_id')->nullable()->constrained('categories');
            $table->string('status')->default(\App\Enum\Blog\BlogStatus::PUBLIC);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('blogs');
    }
};
