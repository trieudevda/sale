<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['id','name','slug','parent_id','avatar_image_id','status','created_at','updated_at'];
    protected $casts = [
        'status' => \App\Enum\Category\CategoryStatus::class,
    ];
    public function scopeActive($query)
    {
        return $query->where('status', \App\Enum\Category\CategoryStatus::ACTIVE);
    }
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
    public function ImageChildren()
    {
        return $this->belongsTo(\App\Models\Image::class, 'avatar_image_id');
    }
}
