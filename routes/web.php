<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;

// Route::get('/', function () {
//     return view('welcome');
// });

Route::group(['prefix'=> 'admin','as' => 'admin.'], function () {
    Route::group(['prefix'=> 'category','alias' => 'category.'], function () {
        Route::get('/', [CategoryController::class,'index'])->name('index');
    });                                 
    Route::group(['prefix'=> 'user','as' => 'user.'], function () {
        Route::match(['get', 'post'],'/register', [UserController::class,'register'])->name('register');
        Route::match(['get', 'post'],'/login', [UserController::class,'login'])->name('login');
    });
    Route::group(['prefix'=> 'blog','as' => 'blog.'], function () {
        Route::match(['get', 'post'],'/', [BlogController::class,'index'])->name('index');
        Route::match(['get', 'post'],'/create', [BlogController::class,'create'])->name('create');
        Route::match(['get', 'post'],'/edit/{id}', [BlogController::class,'edit'])->name('edit');
    });
});
Route::group(['prefix'=> 'blog'], function () {
    Route::get('',[BlogController::class, 'index'])->name('blog.index');
    Route::get('/detail/{slug}',[BlogController::class, 'detail'])->name('blog.detail');
});