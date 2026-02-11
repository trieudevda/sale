<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

abstract class Controller
{
    public function uploadImage($nameModel, Request $request): Model|string
    {
        $imageController = app(abstract: ImageController::class);
        $imageData = $imageController->uploadFile($nameModel, $request);
        return $imageData;
    }
}
