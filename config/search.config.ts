export const SEARCH_CONFIG = {
  queryKeys: {
    keyword: 'q',
    page: 'page',
    limit: 'limit',
    sort: 'sort',
  },

  keyword: {
    minLength: 1, // Chỉ áp dụng khi có từ khóa; trang sản phẩm có thể không có q.
    maxLength: 120,
    trim: true,
    collapseWhitespace: true,
  },

  pagination: {
    defaultPage: 1,
    defaultLimit: 24,
    maxLimit: 100,
  },
  user: {
    defaultSort: 'newest',
    sortKeys: [
      'newest',
      'oldest',
      'username_asc',
      'username_desc',
      'name_asc',
      'name_desc',
    ],
    filterKeys: ['status', 'roleId'],
  },
  product: {
    defaultSort: 'newest',
    sortKeys: [
      'newest',
      'oldest',
      'price_asc',
      'price_desc',
      'name_asc',
      'name_desc',
    ],
    filterKeys: ['categoryId', 'brandId', 'minPrice', 'maxPrice', 'inStock'],
    minPrice: 0,
  },
} as const;
export type UserSortKey =
  (typeof SEARCH_CONFIG)['user']['sortKeys'][number];
export type ProductSortKey =
  (typeof SEARCH_CONFIG)['product']['sortKeys'][number];

export type ProductFilterKey =
  (typeof SEARCH_CONFIG)['product']['filterKeys'][number];
