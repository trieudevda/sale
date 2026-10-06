import { UserPermission } from '../../modules/users/user.permissions';

export const DEFAULT_ROLES = [
  {
    code: 'ADMIN',
    name: 'Quản trị viên',
    permissions: [
      ...Object.values(UserPermission),
    ],
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
