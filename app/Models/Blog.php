<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $fillable = ['id','name','slug','avatar','contents','avatar_image_id','category_id','status','created_at','updated_at'];

    // public function parent()
    // {
    //     return $this->belongsTo(\App\Models\Category::class, 'category_id');
    // }
protected $casts = [
    'status' => \App\Enum\Blog\LangBlogStatus::class,
];
    public function cateChildren()
    {
        return $this->belongsTo(\App\Models\Category::class, 'category_id');
    }
    public function ImageChildren()
    {
        return $this->belongsTo(\App\Models\Image::class, 'avatar_image_id');
    }
}