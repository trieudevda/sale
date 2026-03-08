<?php

namespace App\Http\Controllers;

use App\Enum\Blog\BlogStatus;
use App\Enum\Category\CategoryStatus;
use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    private static $nameModel = 'category';
    public function index(Request $request)
    {
        $paginate = $request->get('paginate',config('constants.pagination.limit'));
        $status = $request->get('status',CategoryStatus::ACTIVE);
        $sort = $request->get('sort','desc');
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            $listCate = \App\Models\Category::with('parent','ImageChildren')
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
    public function create(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            if ($request->isMethod('post')) {
                DB::beginTransaction();
                $image = $this->uploadImage(self::$nameModel, $request);
                try {
                    $cate = Category::find($request->category);
                    Category::create([
                        'name' => $request->name,
                        'slug' => $this->generateSlug(Category::class, $request->slug??$request->name),
                        'avatar_image_id' => $image->id ?? null,
                        'parent_id' => $cate->id??null,
                        'status' => CategoryStatus::ACTIVE
                    ]);
                    DB::commit();
                    return redirect()->route('admin.category.index')->with('success', 'Category created successfully');
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Lỗi!', ['error' => $e->getMessage()]);
                    return redirect()->back()->with('error', 'Failed to create category');
                }
            }
            $route = 'create';
            $listCategories = \App\Models\Category::all()->where('status', \App\Enum\Category\CategoryStatus::ACTIVE);
            return view('admin.category.edit', compact('listCategories', 'route'));
        }
    }
    public function edit($id, Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            if ($request->isMethod('post')) {
                DB::beginTransaction();
                try {
//                    dd($request->all());
                    $cate = Category::findOrFail($id);
                    $image = $this->uploadImage(self::$nameModel, $request);
                    if ($image!='' && $cate->avatar_image_id !='') {
                        // remove image
                        $this->removeFile($cate->avatar_image_id);
                    }
                    $cate->update([
                        'name' => $request->name,
                        'slug' => $this->generateSlug(Category::class, $request->slug??$request->name),
                        'avatar_image_id' => $image->id ?? $cate->avatar_image_id,
                        'parent_id' => $request->category ?? $cate->parent_id,
                    ]);
                    DB::commit();

                    return redirect()->route('admin.category.index')->with('success', 'Category edit successfully');
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Lỗi!', ['error' => $e->getMessage()]);

                    return redirect()->back()->with('error', 'Failed to edit category');
                }
            }
            $route = 'edit';
            $cate = Category::with('ImageChildren','parent')->where('id',$id)->first();
            $listCategories = \App\Models\Category::all();
//            dd($cate);
            return view('admin.category.edit', compact('cate', 'listCategories', 'route','id'));
        }
    }
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $cate = Category::findOrFail($id);
            DB::commit();
            $cate->update(['status' => \App\Enum\Category\CategoryStatus::INACTIVE]);
            return redirect()->route('admin.category.index')->with('success', 'Category delete successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi!', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete category');
        }
    }
    public function search(Request $request)
    {
        $paginate = $request->get('paginate',config('constants.pagination.limit'));
        $name = $request->get('name','');
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            $listCate = \App\Models\Category::with('parent', 'ImageChildren')
                ->where('status',CategoryStatus::ACTIVE)
                ->where(function ($query) use ($name) {
                    $query->where('name', 'like', "%{$name}%")
                        ->orWhere('slug', 'like', "%{$name}%");
                })
                ->orderBy('updated_at', 'desc')
                ->paginate($paginate)
                ->withQueryString();
            return view('admin.category.index', compact('listCate'));
        }
        return view('blog.index');
    }
}
