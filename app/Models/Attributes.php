<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attributes extends Model
{
    protected $fillable = ['id','name','created_at','updated_at'];

    protected $casts = [];
    public function values()
    {
        return $this->hasMany(AttributesValues::class, 'attribute_id', 'id');
    }
}
