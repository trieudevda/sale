<?php

namespace App\View\Components\Admin;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use Illuminate\Support\Facades\Request;

class Breadcrumb extends Component
{
    public $items = [];
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        $segments = Request::segments(); // Lấy mảng ['admin', 'blog', 'create']
        $url = '';

        foreach ($segments as $key => $segment) {
            $url .= '/' . $segment;

            if ($segment === 'admin') continue;
            $label = __('admin.' . $segment);

            if (str_contains($label, 'admin.')) {
                $label = ucfirst(str_replace('-', ' ', $segment));
            }

            $this->items[] = [
                'label' => __($label,['action'=>'']),
                'url' => url($url),
            ];
        }
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.admin.breadcrumb');
    }
}
