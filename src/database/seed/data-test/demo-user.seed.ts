/**
 * src/database/seed/data-test/demo-user.seed.ts
 *
 * 10 tài khoản nhân sự Việt Nam GIẢ LẬP, thay cho seed 1.000 user.
 * Thứ tự chạy: seedAuthorization() -> seedBootstrapAdmin() -> seedDemoUsers10().
 *
 * Chỉ chạy khi SEED_DEMO_10=true, NODE_ENV=development|test,
 * DEMO_10_DB trùng DB_DATABASE và DEMO_10_PASSWORD đủ mạnh.
 * Idempotent: không tự sửa/xóa tài khoản, role hay permission đã tồn tại.
 * Không xóa tài khoản demo cũ trong database.
 *
 * Chú ý: User/Role hiện không có cột description. `description` chỉ là
 * metadata mô tả công việc trong seed, không được ghi vào database.
 * Chỉ các permission đã có trong UserPermission mới được sử dụng.
 */
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { DataSource, EntityManager, In } from 'typeorm';

import { Permission } from '../../../modules/authorization/entities/permissions.entity';
import { Role } from '../../../modules/authorization/entities/roles.entity';
import { RoleSource } from '../../../modules/authorization/enums/user-role-source.enum';
import { UserPermission } from '../../../modules/users/permissions/user.permissions';
import { User } from '../../../modules/users/entities/user.entity';
import { UserRole } from '../../../modules/users/entities/user-role.entity';
import { UserClosure } from '../../../modules/users/entities/user-closure.entity';
import { UserStatus } from '../../../modules/users/enums/user-status.enum';

type RoleCode =
  | 'DEMO10_OPERATIONS_MANAGER'
  | 'DEMO10_HR_MANAGER'
  | 'DEMO10_SALES_LEAD'
  | 'DEMO10_SUPPORT_LEAD'
  | 'DEMO10_COORDINATOR'
  | 'DEMO10_HR_SPECIALIST'
  | 'DEMO10_SALES_STAFF'
  | 'DEMO10_SUPPORT_STAFF'
  | 'DEMO10_CONTENT_EDITOR'
  | 'DEMO10_VIEWER';

type StaffSpec = {
  sequence: number;
  roleCode: RoleCode;
  roleName: string;
  level: number;
  permissions: readonly string[];
  firstName: string;
  lastName: string;
  username: string;
  address: string;
  description: string; // Metadata, không phải cột User.
  parentSequence: number; // 0 = bootstrap ADMIN.
};

/** Mỗi nhân sự có 1 role riêng và 1 tập quyền khác nhau. */
export const DEMO_STAFF_10: readonly StaffSpec[] = [
  {
    sequence: 1,
    roleCode: 'DEMO10_OPERATIONS_MANAGER',
    roleName: 'Quản lý vận hành',
    level: 85,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.CREATE,
      UserPermission.UPDATE,
      UserPermission.ROLE_ASSIGN,
      UserPermission.ACTIVATE,
    ],
    firstName: 'Quân',
    lastName: 'Trần Minh',
    username: 'staffdemo10_01',
    address: 'Quận 1, TP. Hồ Chí Minh',
    description: 'Điều phối các bộ phận, quản lý nhân sự trực thuộc và phê duyệt tài khoản mới.',
    parentSequence: 0,
  },
  {
    sequence: 2,
    roleCode: 'DEMO10_HR_MANAGER',
    roleName: 'Trưởng phòng nhân sự',
    level: 75,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.CREATE,
      UserPermission.ROLE_ASSIGN,
      UserPermission.ACTIVATE,
    ],
    firstName: 'Lan',
    lastName: 'Nguyễn Thị Ngọc',
    username: 'staffdemo10_02',
    address: 'Quận Ba Đình, Hà Nội',
    description: 'Phụ trách tuyển dụng, tạo tài khoản và kích hoạt nhân viên dưới quyền.',
    parentSequence: 0,
  },
  {
    sequence: 3,
    roleCode: 'DEMO10_SALES_LEAD',
    roleName: 'Trưởng nhóm kinh doanh',
    level: 65,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.READ,
      UserPermission.CREATE,
      UserPermission.UPDATE,
      UserPermission.ROLE_ASSIGN,
      UserPermission.ACTIVATE,
    ],
    firstName: 'Phúc',
    lastName: 'Lê Hoàng',
    username: 'staffdemo10_03',
    address: 'Quận Bình Thạnh, TP. Hồ Chí Minh',
    description: 'Quản lý nhóm bán hàng, tạo và kích hoạt nhân viên bán hàng.',
    parentSequence: 1,
  },
  {
    sequence: 4,
    roleCode: 'DEMO10_SUPPORT_LEAD',
    roleName: 'Trưởng nhóm chăm sóc khách hàng',
    level: 60,
    permissions: [
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.CREATE,
      UserPermission.ROLE_ASSIGN,
      UserPermission.ACTIVATE,
    ],
    firstName: 'Hà',
    lastName: 'Phạm Thu',
    username: 'staffdemo10_04',
    address: 'Quận Hải Châu, Đà Nẵng',
    description: 'Phân công hỗ trợ khách hàng và duyệt tài khoản nhân viên thuộc nhóm.',
    parentSequence: 1,
  },
  {
    sequence: 5,
    roleCode: 'DEMO10_COORDINATOR',
    roleName: 'Điều phối viên vận hành',
    level: 55,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.UPDATE,
    ],
    firstName: 'Anh',
    lastName: 'Võ Đức',
    username: 'staffdemo10_05',
    address: 'TP. Thủ Đức, TP. Hồ Chí Minh',
    description: 'Theo dõi nhân sự trong phạm vi được quản lý và cập nhật hồ sơ bản thân.',
    parentSequence: 1,
  },
  {
    sequence: 6,
    roleCode: 'DEMO10_HR_SPECIALIST',
    roleName: 'Chuyên viên nhân sự',
    level: 45,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
    ],
    firstName: 'Linh',
    lastName: 'Bùi Khánh',
    username: 'staffdemo10_06',
    address: 'Quận Cầu Giấy, Hà Nội',
    description: 'Tra cứu hồ sơ nhân sự trong nhánh được phân quyền, không thể chỉnh sửa.',
    parentSequence: 2,
  },
  {
    sequence: 7,
    roleCode: 'DEMO10_SALES_STAFF',
    roleName: 'Nhân viên kinh doanh',
    level: 35,
    permissions: [UserPermission.FIND_ALL, UserPermission.READ],
    firstName: 'Bảo',
    lastName: 'Đặng Quốc',
    username: 'staffdemo10_07',
    address: 'Quận Gò Vấp, TP. Hồ Chí Minh',
    description: 'Nhân viên kinh doanh tuyến đầu; quyền demo hiện chỉ áp dụng cho module user.',
    parentSequence: 3,
  },
  {
    sequence: 8,
    roleCode: 'DEMO10_SUPPORT_STAFF',
    roleName: 'Nhân viên chăm sóc khách hàng',
    level: 30,
    permissions: [UserPermission.FIND_ONE, UserPermission.READ],
    firstName: 'Phương',
    lastName: 'Đỗ Mai',
    username: 'staffdemo10_08',
    address: 'Quận Thanh Khê, Đà Nẵng',
    description: 'Tra cứu hồ sơ bản thân và sử dụng các chức năng đọc được phân quyền.',
    parentSequence: 4,
  },
  {
    sequence: 9,
    roleCode: 'DEMO10_CONTENT_EDITOR',
    roleName: 'Biên tập viên nội dung',
    level: 25,
    permissions: [UserPermission.READ, UserPermission.UPDATE],
    firstName: 'Huy',
    lastName: 'Hồ Gia',
    username: 'staffdemo10_09',
    address: 'Quận Tân Bình, TP. Hồ Chí Minh',
    description: 'Nhân sự nội dung; có quyền cập nhật hồ sơ cá nhân, không có quyền quản lý user.',
    parentSequence: 3,
  },
  {
    sequence: 10,
    roleCode: 'DEMO10_VIEWER',
    roleName: 'Nhân viên tập sự',
    level: 10,
    permissions: [UserPermission.READ],
    firstName: 'Vy',
    lastName: 'Ngô Thảo',
    username: 'staffdemo10_10',
    address: 'Quận Ninh Kiều, Cần Thơ',
    description: 'Tài khoản tập sự chỉ có quyền đọc cơ bản, không được xem danh sách hay sửa dữ liệu.',
    parentSequence: 4,
  },
];

function environmentPassword(): string | null {
  if (process.env.SEED_DEMO_10 !== 'true') {
    console.info('[demo-10] Bỏ qua: SEED_DEMO_10 chưa bật.');
    return null;
  }

  // if (!['development', 'test'].includes(process.env.NODE_ENV ?? '')) {
  //   throw new Error('Demo seed chỉ cho phép NODE_ENV=development hoặc test.');
  // }

  const dbName = process.env.DB_DATABASE?.trim();
  const confirmedDb = process.env.DEMO_10_DB?.trim();
  if (!dbName || !confirmedDb || dbName !== confirmedDb) {
    throw new Error('DEMO_10_DB phải trùng chính xác DB_DATABASE.');
  }

  const password = process.env.DEMO_10_PASSWORD;
  if (!password || password.length < 16 || password.length > 255) {
    throw new Error('DEMO_10_PASSWORD phải dài từ 16 đến 255 ký tự.');
  }
  if (!process.env.BOOTSTRAP_ADMIN_USERNAME?.trim()) {
    throw new Error('Thiếu BOOTSTRAP_ADMIN_USERNAME.');
  }
  return password;
}

function identity(spec: StaffSpec) {
  // Tên và địa chỉ như thật, nhưng email và phone được dành riêng cho thử nghiệm.
  return {
    username: spec.username,
    email: `${spec.username}@example.invalid`,
    phone: `+99988${String(spec.sequence).padStart(10, '0')}`,
    firstName: spec.firstName,
    lastName: spec.lastName,
    address: spec.address,
  };
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && new Set(a).size === a.length &&
    a.every((item) => b.includes(item));
}

function assertPlan(): void {
  if (DEMO_STAFF_10.length !== 10) throw new Error('Phải có đúng 10 user.');
  const ids = new Set<number>();
  const codes = new Set<string>();
  const usernames = new Set<string>();
  const signatures = new Set<string>();
  const bySequence = new Map<number, StaffSpec>();
  for (const spec of DEMO_STAFF_10) {
    if (ids.has(spec.sequence) || codes.has(spec.roleCode) || usernames.has(spec.username)) {
      throw new Error('Demo plan trùng sequence, role hoặc username.');
    }
    ids.add(spec.sequence);
    codes.add(spec.roleCode);
    usernames.add(spec.username);
    const signature = [...spec.permissions].sort().join('|');
    if (signatures.has(signature)) {
      throw new Error('Các user phải có tập permission khác nhau.');
    }
    signatures.add(signature);
    if (spec.parentSequence !== 0) {
      const parent = bySequence.get(spec.parentSequence);
      if (!parent || parent.level <= spec.level ||
          spec.permissions.some((code) => !parent.permissions.includes(code))) {
        throw new Error(`Phân cấp hoặc quyền sai tại ${spec.username}.`);
      }
    }
    bySequence.set(spec.sequence, spec);
  }
}

async function ensureRole(
  manager: EntityManager,
  spec: StaffSpec,
  permissionsByCode: Map<string, Permission>,
): Promise<Role> {
  const repo = manager.getRepository(Role);
  let role = await repo.findOne({
    where: { code: spec.roleCode },
    relations: { permissions: true },
  });
  if (role) {
    if (role.source !== RoleSource.CUSTOM || role.level !== spec.level ||
        role.name !== spec.roleName ||
        !sameSet(role.permissions.map((p) => p.code), spec.permissions)) {
      throw new Error(`Role ${spec.roleCode} đã tồn tại với cấu hình khác; không ghi đè.`);
    }
    return role;
  }
  role = repo.create({
    code: spec.roleCode,
    name: spec.roleName,
    source: RoleSource.CUSTOM,
    level: spec.level,
    permissions: spec.permissions.map((code) => {
      const permission = permissionsByCode.get(code);
      if (!permission) throw new Error(`Permission ${code} không tồn tại.`);
      return permission;
    }),
  });
  return repo.save(role);
}

async function rootAdmin(manager: EntityManager): Promise<User> {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME!.trim();
  const users = manager.getRepository(User);
  const root = await users.findOneBy({ username });
  if (!root || root.status !== UserStatus.ACTIVE || root.parentId != null) {
    throw new Error('Bootstrap ADMIN phải ACTIVE và không có parentId.');
  }
  const admin = await manager.getRepository(Role).findOneBy({ code: 'ADMIN' });
  if (!admin || admin.level <= 85 ||
      !(await manager.getRepository(UserRole).existsBy({ userId: root.id, roleId: admin.id }))) {
    throw new Error('Tài khoản bootstrap phải sở hữu role ADMIN có level > 85.');
  }

  const closure = manager.getRepository(UserClosure);
  const paths = await closure.findBy({ descendantId: root.id });
  if (paths.length === 0) {
    if (await closure.countBy({ ancestorId: root.id })) {
      throw new Error('Root có hậu duệ nhưng thiếu self-path, cần sửa dữ liệu thủ công.');
    }
    await closure.insert({ ancestorId: root.id, descendantId: root.id, depth: 0 });
  } else if (paths.length !== 1 || paths[0].ancestorId !== root.id || paths[0].depth !== 0) {
    throw new Error('Bootstrap ADMIN có user_closure bất thường.');
  }
  return root;
}

async function createOrValidateUser(
  manager: EntityManager,
  spec: StaffSpec,
  parentId: string,
  role: Role,
  passwordHash: string,
): Promise<{ id: string; inserted: boolean }> {
  const users = manager.getRepository(User);
  const userRoles = manager.getRepository(UserRole);
  const closure = manager.getRepository(UserClosure);
  const data = identity(spec);

  const parentPaths = await closure.findBy({ descendantId: parentId });
  if (!parentPaths.some((p) => p.ancestorId === parentId && p.depth === 0)) {
    throw new Error(`Parent của ${spec.username} thiếu closure self-path.`);
  }
  const pathsWithoutSelf = parentPaths.map((p) => ({
    ancestorId: p.ancestorId,
    depth: p.depth + 1,
  }));

  const existing = await users.findOneBy({ username: spec.username });
  if (existing) {
    if (existing.email !== data.email || existing.phone !== data.phone ||
        existing.firstName !== data.firstName || existing.lastName !== data.lastName ||
        existing.address !== data.address || existing.status !== UserStatus.ACTIVE ||
        existing.parentId !== parentId || existing.createdBy !== parentId) {
      throw new Error(`User ${spec.username} có thông tin khác seed; từ chối thay đổi.`);
    }
    const assignments = await userRoles.findBy({ userId: existing.id });
    if (assignments.length !== 1 || assignments[0].roleId !== role.id) {
      throw new Error(`User ${spec.username} có role khác seed; từ chối thay đổi.`);
    }
    const foundPaths = await closure.findBy({ descendantId: existing.id });
    const expectedPaths = [...pathsWithoutSelf, { ancestorId: existing.id, depth: 0 }];
    if (foundPaths.length !== expectedPaths.length || expectedPaths.some(
      (want) => !foundPaths.some((got) =>
        got.ancestorId === want.ancestorId && got.depth === want.depth))) {
      throw new Error(`User ${spec.username} có cây phân cấp khác seed; từ chối thay đổi.`);
    }
    return { id: existing.id, inserted: false };
  }

  const created = await users.save(users.create({
    id: uuidv7(),
    ...data,
    passwordHash,
    status: UserStatus.ACTIVE,
    parentId,
    createdBy: parentId,
  }));
  await userRoles.insert({ userId: created.id, roleId: role.id });
  await closure.insert([
    ...pathsWithoutSelf.map((path) => ({
      ancestorId: path.ancestorId,
      descendantId: created.id,
      depth: path.depth,
    })),
    { ancestorId: created.id, descendantId: created.id, depth: 0 },
  ]);
  return { id: created.id, inserted: true };
}

export async function seedDemoUsers10(ds: DataSource): Promise<void> {
  const password = environmentPassword();
  if (password === null) return;
  if (!ds.isInitialized) throw new Error('DataSource chưa được initialize.');
  assertPlan();

  // Hash riêng từng người, không chạy 10 Argon2 đồng thời để tránh tốn RAM.
  const hashes = new Map<number, string>();
  for (const spec of DEMO_STAFF_10) {
    hashes.set(spec.sequence, await argon2.hash(password, { type: argon2.argon2id }));
  }

  const inserted = await ds.transaction(async (manager) => {
    const root = await rootAdmin(manager);
    const allCodes = [...new Set(DEMO_STAFF_10.flatMap((spec) => [...spec.permissions]))];
    const permissions = await manager.getRepository(Permission).find({
      where: { code: In(allCodes), isActive: true },
    });
    const permissionsByCode = new Map(permissions.map((p) => [p.code, p]));
    const missing = allCodes.filter((code) => !permissionsByCode.has(code));
    if (missing.length) {
      throw new Error(`Thiếu permission ${missing.join(', ')}; hãy chạy seedAuthorization() trước.`);
    }

    const roleByCode = new Map<RoleCode, Role>();
    for (const spec of DEMO_STAFF_10) {
      roleByCode.set(spec.roleCode, await ensureRole(manager, spec, permissionsByCode));
    }

    const userIds = new Map<number, string>([[0, root.id]]);
    let count = 0;
    for (const spec of DEMO_STAFF_10) {
      const parentId = userIds.get(spec.parentSequence);
      const role = roleByCode.get(spec.roleCode);
      const hash = hashes.get(spec.sequence);
      if (!parentId || !role || !hash) throw new Error(`Thiếu parent/role/hash: ${spec.username}`);
      const result = await createOrValidateUser(manager, spec, parentId, role, hash);
      userIds.set(spec.sequence, result.id);
      if (result.inserted) count++;
    }
    return count;
  });

  console.info(`[demo-10] Hoàn thành: ${inserted} user mới, ${10 - inserted} user đã xác minh.`);
  console.info('[demo-10] Tất cả tài khoản ACTIVE; mật khẩu từ DEMO_10_PASSWORD (không hiển thị).');
}
