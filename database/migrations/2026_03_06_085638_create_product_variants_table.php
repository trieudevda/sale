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
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->string('sku')->unique();
            // Hình ảnh riêng cho biến thể (ví dụ: ảnh màu đỏ, màu xanh)
            $table->string('avatar')->nullable();
            $table->json('album')->nullable();
            $table->string('variant_name')->nullable(); // Tên mô tả (ví dụ: Đỏ, Size L)
            // Giá và kho (có thể khác với giá gốc của sản phẩm)
            $table->decimal('price', 15, 2)->nullable(); // Giá riêng nếu có
            $table->integer('stock_qty')->default(0);    // Số lượng tồn kho riêng
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
