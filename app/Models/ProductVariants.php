<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariants extends Model
{
    protected $fillable = ['id','product_id','sku','variant_name','price','stock_qty','image','created_at','updated_at'];

    protected $casts = [];
    public function products()
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
