@extends('partials.layout.admin.layout')
@push('scripts')
    <script src="{{ asset('styles/js/uploadFile.js') }}"></script>
    <script src="{{ asset('styles/js/action_admin.js') }}"></script>
    <script>
        setupImagePreview('avatar-input', 'avatar-preview');
    </script>
@endpush
@section('content')
    <div class="flex items-center gap-3">
        <h3 class="mb-2 text-4xl font-bold tracking-tight text-heading md:text-5xl lg:text-6xl">{{__('admin.category',['action'=>''])}}</h3>
        <a type="button" href="{{ route('admin.category.create') }}"
           class="text-white bg-brand box-border border border-transparent h-min hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            {{__('admin.category_start',['action'=>__('admin.add')])}} </a>
    </div>
    <x-admin.breadcrumb />
    <div class="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default">
        <div class="p-4 flex items-center justify-between space-x-4">
            <label for="input-group-1" class="sr-only">{{__('admin.search')}}</label>
            <div class="flex gap-1">
                <div class="relative">
                    <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg class="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                             fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                                  d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input type="text" id="isearch"
                           class="block w-full max-w-96 ps-9 pe-3 py-2 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand shadow-xs placeholder:text-body"
                           placeholder="{{__('admin.search')}}">
                </div>
                <button onclick="action_search_list('isearch','{{route('admin.category.search')}}')" type="button"
                        class="min-w-16 text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                    {{__('admin.send')}}</button>
            </div>
            <button id="dropdownDefaultButton" data-dropdown-toggle="dropdown"
                    class="shrink-0 inline-flex items-center justify-center text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-3 py-2 focus:outline-none"
                    type="button">
                <svg class="w-4 h-4 me-1.5 -ms-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                     fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-width="2"
                          d="M18.796 4H5.204a1 1 0 0 0-.753 1.659l5.302 6.058a1 1 0 0 1 .247.659v4.874a.5.5 0 0 0 .2.4l3 2.25a.5.5 0 0 0 .8-.4v-7.124a1 1 0 0 1 .247-.659l5.302-6.059c.566-.646.106-1.658-.753-1.658Z" />
                </svg>
                {{__('admin.filter')}}
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
                        <a href="{{route('admin.category.index',['status'=>\App\Enum\Category\CategoryStatus::ACTIVE])}}"
                           class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">{{__('admin.active')}}</a>
                    </li>
                    <li>
                        <a href="{{route('admin.category.index',['status'=>\App\Enum\Category\CategoryStatus::INACTIVE])}}"
                           class="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium hover:text-heading rounded">{{__('admin.inactive')}}</a>
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
                        <label for="table-checkbox-20" class="sr-only">{{__('admin.table_checkbox')}}</label>
                    </div>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.category_start',['action' =>  __('admin.name')])}}
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.image')}}
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.path')}}
                </th>
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.category_end',['action'=>__('admin.parent')])}}
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.status')}}
                </th>
                <th scope="col" class="px-6 py-3 font-medium">
                    {{__('admin.action')}}
                </th>
            </tr>
            </thead>
            <tbody>
            @foreach ($listCate as $items)
                <tr class="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium">
                    <td class="w-4 p-4">
                        <div class="flex items-center">
                            <input id="table-checkbox-21" type="checkbox" value=""
                                   class="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft">
                            <label for="table-checkbox-21" class="sr-only">{{__('admin.table_checkbox')}}</label>
                        </div>
                    </td>
                    <th scope="row" class="px-6 py-4 font-medium text-heading whitespace-nowrap">
                        {{ $items->name }}
                    </th>
                    <td class="px-6 py-4">
                        @if($items->ImageChildren)
                            <img src="{{ asset('storage/' . $items->ImageChildren->image_path) }}" width="40" alt="{{ $items->name }}">
                        @endif
                    </td>
                    <td class="px-6 py-4">
                        {{ $items->slug }}
                    </td>
                    <td class="px-6 py-4">
                        {{ $items->parent->name ?? '' }}
                    </td>
                    <td class="px-6 py-4">
                        {{ $items->status->label() ?? '' }}
                    </td>
                    <td class="px-6 py-4 w-32 flex justify-content-center">
                        <a href="{{ route('admin.category.edit', $items->id) }}" class="font-medium text-fg-brand hover:underline">
                            <img src="/image/svg/edit.svg" width="30" height="30" alt="{{__('admin.edit')}}"/>
                        </a>
                        <a href="{{ route('admin.category.delete', $items->id) }}" class="font-medium text-fg-brand hover:underline">
                            <img src="/image/svg/delete.svg" width="30" height="30" alt="{{__('admin.delete')}}"/>
                        </a>
                    </td>
                </tr>
            @endforeach
            </tbody>
        </table>
        @if ($listCate->lastPage() > 1)
            <nav class="custom-paginate flex items-center flex-column flex-wrap md:flex-row justify-between p-4" aria-label="Table navigation">
                <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                    <div class="flex-1 flex justify-between sm:hidden">
                        {!! $listCate->links('pagination::simple-tailwind') !!}
                    </div>
                    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            {!! $listCate->links() !!}
                        </div>
                    </div>
                </div>
            </nav>
        @endif
    </div>
@endsection
