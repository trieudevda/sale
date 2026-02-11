@extends('partials.layout.admin.layout')
@push('scripts')
  <script src="{{ asset('styles/js/uploadFile.js') }}"></script>
  <script>
    setupImagePreview('avatar-input', 'avatar-preview');
  </script>
@endpush
@section('content')
  <h3 class="mb-2 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl"> {{ $route == 'create' ? 'Thêm' : 'Sửa' }} bài viết</h3>
  @include('partials.layout.admin.breadcrumb')
  <form method="post" href="{{ route('admin.blog.' . $route) }}" class="" enctype="multipart/form-data">
    @csrf
    <div class="mb-5">
      <label for="name" class="block mb-2.5 text-sm font-medium text-heading">Tên bài viết</label>
      <input type="text" id="name" name="name" value="{{ old('name') }}"
        class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
        placeholder="Tên bài viết" required />
    </div>
    <div class="mb-5">
      <label for="slug" class="block mb-2.5 text-sm font-medium text-heading">Tên đường dẫn</label>
      <input type="text" id="slug" name="slug" value="{{ old('slug') }}"
        class="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
        placeholder="Tên đường dẫn" required />
    </div>
    <div class="mb-5">
      <label class="block mb-2.5 text-sm font-medium text-heading" for="file_input">Ảnh đại diện</label>
      <input id="avatar-input" name="avatar" value="{{ old('avatar') }}"
        class="cursor-pointer bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full shadow-xs placeholder:text-body"
        id="file_input" type="file"  accept="image/*">
         <div class="flex items-center justify-center w-full">
        <img id="avatar-preview" src="#" alt="Preview" class="hidden w-32 h-32 rounded-lg object-cover border border-gray-300">
    </div>
    </div>
    <div class="mb-5">
      <select id="countries" name="category" value="{{ old('category') }}"
        class="block w-full px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body">
        @if($listCategories->isEmpty())        
            <option selected>Chọn danh mục</option>
        @endif
        @foreach($listCategories as $cat)
          <option value="{{ $cat->id }}" {{ old('category') == $cat->id ? 'selected' : '' }}>
            {{ $cat->name }}
          </option>
        @endforeach
      </select>
    </div>
    {{-- <div class="mb-6">
      <label for="success" class="block mb-2.5 text-sm font-medium text-fg-success-strong">Your name</label>
      <input type="text" id="success"
        class="bg-success-soft border border-success-subtle text-fg-success-strong text-sm rounded-base focus:ring-success focus:border-success block w-full px-3 py-2.5 shadow-xs placeholder:text-fg-success-strong"
        placeholder="Success input">
      <p class="mt-2.5 text-sm text-fg-success-strong"><span class="font-medium">Well done!</span> Some success message.
      </p>
    </div>
    <div class="mb-6">
      <label for="danger" class="block mb-2.5 text-sm font-medium text-fg-danger-strong">Your name</label>
      <input type="text" id="danger"
        class="bg-danger-soft border border-danger-subtle text-fg-danger-strong text-sm rounded-base focus:ring-danger focus:border-danger block w-full px-3 py-2.5 shadow-xs placeholder:text-fg-danger-strong"
        placeholder="Error input">
      <p class="mt-2.5 text-sm text-fg-danger-strong"><span class="font-medium">Oh, snapp!</span> Some error message.</p>
    </div> --}}
    @include('partials.contents.WYSIWYG')
    {{-- <button id="saveButton" type="button">saveButton</button> --}}
    <button id="saveButton" type="submit"
      class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Submit</button>
  </form>

@endsection