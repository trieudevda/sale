<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariantAttribute extends Model
{
    protected $fillable = ['id','product_variant_id','attribute_value_id'];

    protected $casts = [];
}
