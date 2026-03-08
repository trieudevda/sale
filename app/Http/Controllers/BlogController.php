<?php

namespace App\Http\Controllers;

use App\Enum\Blog\BlogStatus;
use App\Models\Blog;
use App\Models\Category;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BlogController extends Controller
{
    private static $nameModel = 'blog';

    public function index(Request $request)
    {
        $paginate = $request->get('paginate',config('constants.pagination.limit'));
        $status = $request->get('status',BlogStatus::PUBLIC);
        $sort = $request->get('sort','desc');
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            $listBlog = \App\Models\Blog::with('cateChildren', 'ImageChildren')
                ->where('status', $status)
                ->orderBy('created_at', $sort === 'asc' ? 'asc' : 'desc')
                ->paginate($paginate)
                ->withQueryString();
            return view('admin.blog.index', compact('listBlog'));
        }
        return view('blog.index');
    }

    public function detail($slug)
    {
        return view('blog.detail', ['slug' => $slug]);
    }

    public function create(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            if ($request->isMethod('post')) {
                DB::beginTransaction();
                try {
                    $cate = Category::find($request->category);
                    $image = $this->uploadImage(self::$nameModel, $request);
                    Blog::create([
                        'name' => $request->name,
                        'slug' => $this->generateSlug(Blog::class, $request->slug??$request->name),
                        'avatar_image_id' => $image->id ?? null,
                        'contents' => $request->contents,
                        'category_id' => $cate->id ?? null,
                    ]);
                    DB::commit();

                    return redirect()->route('admin.blog.index')->with('success', 'Blog created successfully');
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Lỗi!', ['error' => $e->getMessage()]);

                    return redirect()->back()->with('error', 'Failed to create blog');
                }
            }
            $route = 'create';
            $listCategories = \App\Models\Category::all()->where('status', \App\Enum\Category\CategoryStatus::ACTIVE);
            return view('admin.blog.edit', compact('listCategories', 'route'));
        }
    }
    public function edit($id, Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            if ($request->isMethod('post')) {dd($request->all());
                $blog = Blog::findOrFail($id); //404
                DB::beginTransaction();
                try {
                    $cate = Category::find($request->category);
                    $image = $this->uploadImage(self::$nameModel, $request);
                    if ($image!='' && $blog->avatar_image_id !='') {
                        // remove image
                        $this->removeFile($blog->avatar_image_id);
                    }
                    $blog->update([
                        'name' => $request->name,
                        'slug' => $this->generateSlug(Blog::class, $request->slug??$request->name),
                        'avatar_image_id' => $image->id ?? $blog->avatar_image_id,
                        'contents' => $request->contents,
                        'category_id' => $cate->id ?? null,
                    ]);
                    DB::commit();

                    return redirect()->route('admin.blog.index')->with('success', 'Blog edit successfully');
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('Lỗi!', ['error' => $e->getMessage()]);

                    return redirect()->back()->with('error', 'Failed to edit blog');
                }
            }
            $route = 'edit';
            $blog = Blog::with('ImageChildren','CateChildren')->where('id',$id)->first();
            $listCategories = \App\Models\Category::all();
            return view('admin.blog.edit', compact('blog', 'listCategories', 'route','id'));
        }
    }
    public function delete($id)
    {
        DB::beginTransaction();
        try {
            $blog = Blog::findOrFail($id);
            DB::commit();
            $blog->update(['status' => \App\Enum\Blog\BlogStatus::DELETED]);
            return redirect()->route('admin.blog.index')->with('success', 'Blog delete successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi!', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Failed to delete blog');
        }
    }
    public function search(Request $request)
    {
        $paginate = $request->get('paginate',config('constants.pagination.limit'));
        $name = $request->get('name','');
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            $listBlog = \App\Models\Blog::with('cateChildren', 'ImageChildren')
                ->where('status',BlogStatus::PUBLIC)
                ->where(function ($query) use ($name) {
                    $query->where('name', 'like', "%{$name}%")
                        ->orWhere('slug', 'like', "%{$name}%")
                        ->orWhere('contents', 'like', "%{$name}%");
                })
                ->orderBy('updated_at', 'desc')
                ->paginate($paginate)
                ->withQueryString();
            return view('admin.blog.index', compact('listBlog'));
        }
        return view('blog.index');
    }
}
