@php
$logo = [
  'logo' => 'https://flowbite.com/docs/images/logo.svg',
  'alt' => 'Flowbite Logo',
  'name' => 'Flowbite'
];
  $pathlink = [
    [
      'href' => '#',
      'label' => 'Giới Thiệu'
    ],
    [
      'href' => '#',
      'label' => 'Dịch Vụ'
    ],
    [
      'href' => '#',
      'label' => 'Thanh Toán'
    ],
    [
      'href' => '#',
      'label' => 'Liên Hệ'
    ]
  ]
@endphp
<nav class="sticky w-full z-20 top-0 start-0 border-b border-default bg-gray-100">
  <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
    <a href="#" class="flex items-center space-x-3 rtl:space-x-reverse">
        <img src="{{ $logo['logo'] }}" class="h-7" alt="{{ $logo['alt'] }}" />
        <span class="self-center text-xl text-heading font-semibold whitespace-nowrap">{{ $logo['name'] }}</span>
    </a>
    <button data-collapse-toggle="navbar-default" type="button" class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-body rounded-base md:hidden hover:bg-neutral-secondary-soft hover:text-heading focus:outline-none focus:ring-2 focus:ring-neutral-tertiary" aria-controls="navbar-default" aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg class="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M5 7h14M5 12h14M5 17h14"/></svg>
    </button> 
    <div class="hidden w-full md:block md:w-auto" id="navbar-default">
      <ul class="font-medium flex flex-col p-4 md:p-0 mt-4 border border-default rounded-base bg-neutral-secondary-soft md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-neutral-primary">
        <li>
          <a href="#" class="block py-2 px-3 text-white bg-brand rounded md:bg-transparent md:text-fg-brand md:p-0" aria-current="page">Home</a>
        </li>
        @foreach ($pathlink as $item)
          <li>
          <a href="{{ $item['href'] }}" class="block py-2 px-3 text-heading rounded hover:bg-neutral-tertiary md:hover:bg-transparent md:border-0 md:hover:text-fg-brand md:p-0 md:dark:hover:bg-transparent">{{ $item['label'] }}</a>
        </li>
        @endforeach
      </ul>
    </div>
  </div>
</nav>