<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = ['id','name','slug','description','price','stock','image','is_active','category_id','created_at','updated_at'];

    protected $casts = [];
    public function variants()
    {
        return $this->hasMany(ProductVariants::class, 'product_id', 'id');
    }
}
