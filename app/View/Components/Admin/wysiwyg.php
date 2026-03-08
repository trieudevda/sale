<?php

namespace App\View\Components\Admin;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class wysiwyg extends Component
{
    public $contents;
    /**
     * Create a new component instance.
     */
    public function __construct($contents = '')
    {
        $this->contents = $contents;
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.admin.wysiwyg');
    }
}
