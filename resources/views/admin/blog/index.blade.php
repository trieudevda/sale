@extends('partials.layout.admin.layout')
@push('scripts')
  <script src="{{ asset('styles/js/uploadFile.js') }}"></script>
  <script>
    setupImagePreview('avatar-input', 'avatar-preview');
  </script>
@endpush
@section('content')
  <div class="flex items-center gap-3">
    <h3 class="mb-2 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl">Bài viết</h3>
    <a type="button" href="{{ route('admin.blog.create') }}"
      class="text-white bg-brand box-border border border-transparent h-min hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Thêm
      bài viết</a>
  </div>
  @include('partials.layout.admin.breadcrumb')
  <div class="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
    <div class="p-4 flex items-center justify-between space-x-4">
      <label for="input-group-1" class="sr-only">Tìm kiếm</label>
      <div class="relative">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
            fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
          </svg>
        </div>
        <input type="text" id="input-group-1"
          class="block w-full max-w-96 ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
          placeholder="Tìm kiếm">
      </div>
      <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown"
        class="shrink-0 inline-flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
        type="button">
        <svg class="w-4 h-4 me-1.5 -ms-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
            d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z" />
        </svg>
        Bộ lọc
        <svg class="w-4 h-4 ms-1.5 -me-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 9-7 7-7-7" />
        </svg>
      </button>
      <!-- Dropdown menu -->
      <div id="dropdown"
        class="z-10 hidden bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-32">
        <ul class="p-2 text-sm text-body font-medium" aria-labelledby="dropdownDefaultButton">
          <li>
            <a href="#"
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Color</a>
          </li>
          <li>
            <a href="#"
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Category</a>
          </li>
          <li>
            <a href="#"
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Price</a>
          </li>
          <li>
            <a href="#"
              class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">Sign
              out</a>
          </li>
        </ul>
      </div>
    </div>
    <table class="w-full text-sm text-left rtl:text-right text-body">
      <thead class="text-sm text-body bg-neutral-secondary-medium border-b border-t border-default-medium">
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input id="table-checkbox-20" type="checkbox" value=""
                class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft">
              <label for="table-checkbox-20" class="sr-only">Table checkbox</label>
            </div>
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Tên bài viết
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Đường dẫn
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Nội dung
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Hình ảnh
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Danh mục
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Trạng thái
          </th>
          <th scope="col" class="px-6 py-3 font-medium">
            Hành động
          </th>
        </tr>
      </thead>
      <tbody>
        @foreach ($listBlog as $items)
          <tr class="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
            <td class="w-4 p-4">
              <div class="flex items-center">
                <input id="table-checkbox-21" type="checkbox" value=""
                  class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft">
                <label for="table-checkbox-21" class="sr-only">Table checkbox</label>
              </div>
            </td>
            <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
              {{ $items->name }}
            </th>
            <td class="px-6 py-4">
              {{ $items->slug }}
            </td>
            <td class="px-6 py-4">
              {{ $items->contents }}
            </td>
            <td class="px-6 py-4">
              @if($items->ImageChildren)
                <img src="{{ asset('storage/' . $items->ImageChildren->image_path) }}" width="40" alt="{{ $items->name }}">
              @endif
            </td>
            <td class="px-6 py-4">
              {{ $items->cateChildren->name ?? '' }}
            </td>
            <td class="px-6 py-4">
              {{ $items->status->label() ?? '' }}
            </td>
            <td class="px-6 py-4">
              <a href="{{ route('admin.blog.edit', $items->id) }}" class="font-medium text-fg-brand hover:underline">Sửa</a>
              <a href="{{ route('admin.blog.edit', $items->id) }}" class="font-medium text-fg-brand hover:underline">Xóa</a>
            </td>
          </tr>
        @endforeach
      </tbody>
    </table>
    <nav class="flex items-center flex-column flex-wrap md:flex-row justify-between p-4" aria-label="Table navigation">
      <span class="text-sm font-normal text-body mb-4 md:mb-0 block w-full md:inline md:w-auto">Showing <span
          class="font-semibold text-heading">1-10</span> of <span class="font-semibold text-heading">1000</span></span>
      <ul class="flex -space-x-px text-sm">
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium rounded-s-base text-sm px-3 h-9 focus:outline-none">Previous</a>
        </li>
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">1</a>
        </li>
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">2</a>
        </li>
        <li>
          <a href="#" aria-current="page"
            class="flex items-center justify-center text-fg-brand bg-brand-softer box-border border border-default-medium hover:bg-brand-soft hover:text-fg-brand font-medium text-sm w-9 h-9 focus:outline-none">3</a>
        </li>
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">...</a>
        </li>
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium text-sm w-9 h-9 focus:outline-none">5</a>
        </li>
        <li>
          <a href="#"
            class="flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading font-medium rounded-e-base text-sm px-3 h-9 focus:outline-none">Next</a>
        </li>
      </ul>
    </nav>
  </div>

  <button id="saveButton" type="submit"
    class="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Submit</button>
  </form>

@endsection