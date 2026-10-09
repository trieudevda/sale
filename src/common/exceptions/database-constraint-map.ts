export interface DatabaseConstraintInfo {
  code: string;
  message: string;
}

export const DATABASE_CONSTRAINT_MAP: Record<string, DatabaseConstraintInfo> = {
  // Users
  uq_users_email: {
    code: 'USER_EMAIL_ALREADY_EXISTS',
    message: 'Email đã được sử dụng',
  },

  uq_users_username: {
    code: 'USERNAME_ALREADY_EXISTS',
    message: 'Tên đăng nhập đã tồn tại',
  },

  // Authorization
  uq_roles_code: {
    code: 'ROLE_CODE_ALREADY_EXISTS',
    message: 'Mã vai trò đã tồn tại',
  },

  // Customers
  uq_customers_phone: {
    code: 'CUSTOMER_PHONE_ALREADY_EXISTS',
    message: 'Số điện thoại khách hàng đã tồn tại',
  },

  uq_customers_email: {
    code: 'CUSTOMER_EMAIL_ALREADY_EXISTS',
    message: 'Email khách hàng đã tồn tại',
  },

  // Products
  uq_products_sku: {
    code: 'PRODUCT_SKU_ALREADY_EXISTS',
    message: 'Mã sản phẩm đã tồn tại',
  },

  uq_products_slug: {
    code: 'PRODUCT_SLUG_ALREADY_EXISTS',
    message: 'Slug sản phẩm đã tồn tại',
  },

  // Categories
  uq_categories_name: {
    code: 'CATEGORY_NAME_ALREADY_EXISTS',
    message: 'Tên danh mục đã tồn tại',
  },

  // Suppliers
  uq_suppliers_code: {
    code: 'SUPPLIER_CODE_ALREADY_EXISTS',
    message: 'Mã nhà cung cấp đã tồn tại',
  },

  // Warehouse
  uq_warehouses_code: {
    code: 'WAREHOUSE_CODE_ALREADY_EXISTS',
    message: 'Mã kho đã tồn tại',
  },
};
