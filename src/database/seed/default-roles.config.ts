export const DEFAULT_ROLES = [
  {
    code: 'ADMIN',
    name: 'Quản trị viên',
    grantAllPermissions: true,
    permissions: [],
  },

  // {
  //   code: 'CASHIER',
  //   name: 'Thu ngân',
  //   permissions: [
  //     ProductPermission.READ,
  //
  //     OrderPermission.READ,
  //     OrderPermission.CREATE,
  //   ],
  // },
  //
  // {
  //   code: 'WAREHOUSE',
  //   name: 'Nhân viên kho',
  //   permissions: [
  //     ProductPermission.READ,
  //
  //     InventoryPermission.READ,
  //     InventoryPermission.ADJUST,
  //     InventoryPermission.RECEIVE,
  //   ],
  // },
] as const;
