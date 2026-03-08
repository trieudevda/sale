<nav class="flex mb-2" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li class="inline-flex items-center">
            <a href="#" class="inline-flex items-center text-sm font-medium text-body hover:text-fg-brand">
                <svg class="w-4 h-4 me-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/></svg>
                {{__('admin.admin')}}
            </a>
        </li>

        @foreach($items as $item)
            <li {{ $loop->last ? 'aria-current=page' : '' }}>
                <div class="flex items-center space-x-1.5">
                    <svg class="w-3.5 h-3.5 text-body" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7"/></svg>

                    @if(!$loop->last)
                        <a href="{{ $item['url'] }}" class="inline-flex items-center text-sm font-medium text-body hover:text-fg-brand">
                            {{ $item['label'] }}
                        </a>
                    @else
                        <span class="inline-flex items-center text-sm font-medium text-body-subtle">
                            {{ $item['label'] }}
                          </span>
                    @endif
                </div>
            </li>
        @endforeach
    </ol>
</nav>
