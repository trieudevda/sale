<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ImageController extends Controller
{
    public function uploadFile($nameModel, Request $request)
    {
        $request->validate([
            'avatar' => 'image|mimes:jpeg,png,jpg,gif,svg,webp|max:20480',
        ]);
        $path = '';
        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');
            $folderPath = date('Y/m/d');
            $originalName = $file->getClientOriginalName();
            $customName = $folderPath.'/'.random_int(1, 9999).'_'.$originalName;
            $customName = Str::slug($customName);
            $path = $file->storeAs($nameModel, $customName, 'public');
            DB::beginTransaction();
            try {
                $image = Image::create([
                    'name' => $request->name,
                    'image_path' => $path,
                    'description' => $request->description ?? null,
                ]);
                DB::commit();
                return $image;
            } catch (\Exception $e) {
                DB::rollBack();
                Storage::disk('public')->delete($path);
                Log::error('Lỗi!', [ 'error' => $e->getMessage()]);
            }
        }
        return '';
    }

    public function removeFile($id)
    {
        $image = Image::findOrFail($id);
        if (Storage::disk('public')->exists($image->image_path)) {
            Storage::disk('public')->delete($image->image_path);
        }
        $image->delete();

        return back()->with('success', 'Đã xóa ảnh thành công!');
    }
}
