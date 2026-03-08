@php
    $imagePath = $cate->ImageChildren->image_path ?? null;
    $hasImage = $imagePath && file_exists(public_path('storage/' . $imagePath));
@endphp
@extends('partials.layout.admin.layout')
@push('scripts')
    <script src="{{ asset('styles/js/uploadFile.js') }}"></script>
    <script>
        setupImagePreview('avatar-input', 'avatar-preview');
    </script>
@endpush
@section('content')
  <h3 class="mb-2 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl">{{__('admin.category_start',['action' => ($route == 'create' ? __('admin.add') : __('admin.edit'))])}}</h3>
  <x-admin.breadcrumb />
  <form method="post" href="{{ route('admin.category.' . $route, ['id' => $id ?? '']) }}" class="" enctype="multipart/form-data">
    @csrf
    <div class="mb-5">
      <label for="name" class="block mb-2.5 text-sm font-medium text-heading">{{__('admin.category_start',['action' => __('admin.name')])}}</label>
      <input type="text" id="name" name="name" value="{{ old('name',$cate->name ?? '') }}"
        class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
        placeholder="{{__('admin.category_start', ['action' => __('admin.name')])}}" required />
    </div>
    <div class="mb-5">
          <label for="slug" class="block mb-2.5 text-sm font-medium text-heading">{{__('admin.name_path',['action' => __('admin.name')])}}</label>
      <input type="text" id="slug" name="slug" value="{{ old('slug',$cate->slug ?? '') }}"
        class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
        placeholder="{{__('admin.name_path', ['action' => __('admin.name')])}}" @if($route=="edit") required @endif />
    </div>
    <div class="mb-5">
        <label for="slug" class="block mb-2.5 text-sm font-medium text-heading">{{__('admin.category_start',['action' => __('admin.select')])}}</label>
      <select id="countries" name="category"
        class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
        <option value="0">{{__('admin.select_category')}}</option>
        @foreach($listCategories as $cat)
              @php
                  $isSelected = (isset($cate) && optional($cate->parent)->id == $cat->id) ?? (old('category') == $cat->id);
              @endphp
              <option value="{{ $cat->id }}" {{ $isSelected ? 'selected' : '' }}>
            {{ $cat->name }}
          </option>
        @endforeach
      </select>
    </div>
      <div class="mb-5">
          <label class="block mb-2.5 text-sm font-medium text-heading" for="file_input">{{__('admin.avatar')}}</label>
          <input id="avatar-input" name="avatar" value="{{ old('avatar') }}"
                 class="cursor-pointer bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body"
                 id="file_input" type="file"  accept="image/*">
          <div class="flex items-center justify-center w-full">
              <img id="avatar-preview" src="{{ $hasImage ? asset('storage/' . $cate->ImageChildren->image_path) : '#' }}" alt="Preview"
                   class="{{ !$hasImage ? 'hidden' : '' }} w-32 h-32 rounded-lg object-cover border border-gray-300">
          </div>
      </div>
    <div class="mt-5 text-center">
        <button id="saveButton" type="submit"
          class="min-w-30 text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            {{__('admin.send')}}</button>
    </div>
  </form>

@endsection
