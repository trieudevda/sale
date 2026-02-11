<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::create([
        //     'full_name' => 'Test User',
        //     'email' => 'admin@a.a',
        //     'password'=> 'a',
        // ]);
        Category::create([
            'name' => 'Danh mục 1',
            'slug' => 'danh-muc-1',
        ]);
    }
}
