<?php

namespace App\Enum\Blog;

enum BlogStatus: string
{
    case PUBLIC = 'public';
    case DRAFT = 'draft';
    case DELETED = 'deleted';
}
enum LangBlogStatus: string
{
    case PUBLIC = 'public';
    case DRAFT = 'draft';
    case DELETED = 'deleted';

    // Tạo hàm để lấy label Tiếng Việt
    public function label(): string
    {
        return match($this) {
            self::PUBLIC => 'Công khai',
            self::DRAFT => 'Bản nháp',
            self::DELETED => 'Đã xóa',
        };
    }
}
