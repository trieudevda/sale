<?php

namespace App\Http\Controllers;

use App\Enum\Blog\BlogStatus;
use App\Enum\Category\CategoryStatus;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    private static $nameModel = 'category';
    public function index(Request $request)
    {
        $paginate = $request->get('paginate',15);
        $status = $request->get('status',BlogStatus::PUBLIC);
        $sort = $request->get('sort','desc');
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            $listCate = \App\Models\Category::with('parent')
                ->where('status', $status)
                ->orderBy('created_at', $sort === 'asc' ? 'asc' : 'desc')
                ->paginate($paginate)
                ->withQueryString();
            return view('admin.category.index', compact('listCate'));
        }
//        return view('blog.index');
//        $listCategories = Category::all()->where('status', \App\Enum\Category\CategoryStatus::ACTIVE );
//        return view("admin.category.index", compact('listCategories'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //
    }
}
