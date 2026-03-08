<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttributesValues extends Model
{
    protected $fillable = ['id','attribute_id','value','created_at','updated_at'];

    protected $casts = [];
    public function attribute()
    {
        // Một giá trị thuộc về một Attribute
        return $this->belongsTo(Attributes::class, 'attribute_id', 'id');
    }

    // Kết nối với Biến thể (nếu bạn dùng bảng pivot product_variant_attribute)
    public function variants()
    {
        return $this->belongsToMany(ProductVariantAttribute::class, 'product_variant_attributes');
    }
}
