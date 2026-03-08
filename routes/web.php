<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;

Route::match(['get', 'post'],'/register', [UserController::class,'register'])->name('register');
Route::match(['get', 'post'],'/login', [UserController::class,'login'])->name('login');
Route::group(['middleware' => ['admin.auth'], 'prefix'=> 'admin','as' => 'admin.'], function () {
    Route::group(['prefix'=> 'category','as' => 'category.'], function () {
        Route::get('/', [CategoryController::class,'index'])->name('index');
    });
    Route::group(['prefix'=> 'blog','as' => 'blog.'], function () {
        Route::match(['get', 'post'],'/', [BlogController::class,'index'])->name('index');
        Route::match(['get', 'post'],'/create', [BlogController::class,'create'])->name('create');
        Route::match(['get', 'post'],'/edit/{id}', [BlogController::class,'edit'])->name('edit');
        Route::match(['post'],'/delete/{id}', [BlogController::class,'delete'])->name('delete');
        Route::match(['get'],'/search', [BlogController::class,'search'])->name('search');
    });
    Route::group(['prefix'=> 'category','as' => 'category.'], function () {
        Route::match(['get'],'/', [CategoryController::class,'index'])->name('index');
        Route::match(['get', 'post'],'/create', [CategoryController::class,'create'])->name('create');
        Route::match(['get', 'post'],'/edit/{id}', [CategoryController::class,'edit'])->name('edit');
        Route::match(['get'],'/delete/{id}', [CategoryController::class,'delete'])->name('delete');
        Route::match(['get'],'/search', [CategoryController::class,'search'])->name('search');
    });
});
Route::group(['prefix'=> 'blog'], function () {
    Route::get('',[BlogController::class, 'index'])->name('blog.index');
    Route::get('/detail/{slug}',[BlogController::class, 'detail'])->name('blog.detail');
});
