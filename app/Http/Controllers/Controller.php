<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

abstract class Controller
{
    public function uploadImage($nameModel, Request $request): Model|string
    {
        $imageController = app(abstract: ImageController::class);
        $imageData = $imageController->uploadFile($nameModel, $request);
        return $imageData;
    }
    public function removeFile($id)
    {
        $imageController = app(abstract: ImageController::class);
        $imageController->removeFile($id);
    }
    public function generateSlug($model, string $name): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while ($model::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count;
            $count++;
        }

        return $slug;
    }
}
