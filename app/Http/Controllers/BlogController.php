<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class BlogController extends Controller
{
    private static $nameModel = 'blog';

    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user && $user->role === \App\Enum\User\UserRole::ADMIN) {
            if ($request->isMethod('post')) {
                dd($request->all());
                // $data = $request->all();
                // $data['author_id'] = $user->id;
                // Blog::create($data);
            }
            $listBlog = \App\Models\Blog::with('cateChildren', 'ImageChildren')->where('status', '!=', \App\Enum\Blog\BlogStatus::DELETED)->get();
// dd($listBlog);
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
                        'slug' => $request->slug,
                        'avatar_image_id' => $image->id ?? null,
                        'contents' => $request->content,
                        'category_id' => $cate->id ?? null,
                    ]);
                    DB::commit();

                    return redirect()->route('admin.blog.index')->with('success', 'Blog created successfully');
                } catch (\Exception $e) {
                    dd($e->getMessage());
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
            if ($request->isMethod('post')) {

            }
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Blog $blog)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        //
    }
}
