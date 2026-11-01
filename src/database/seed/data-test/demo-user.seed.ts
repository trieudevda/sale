// /**
//  * src/database/seed/demo-users.seed.ts
//  *
//  * Seed tối đa 10.000.000 user thử nghiệm cho NestJS + TypeORM + MySQL.
//  * Chạy SAU seedAuthorization() và seedBootstrapAdmin().
//  *
//  * Bật bằng SEED_DEMO_10M=true (mặc định tắt).
//  * Kiểm thử trước với SEED_DEMO_USERS_COUNT=1000.
//  * Mỗi lần chạy lại chỉ bổ sung dữ liệu thiếu, không xóa/sửa user đã có.
//  *
//  * KHÔNG chạy trong môi trường production.
//  */
//
// import { randomBytes } from 'node:crypto';
// import * as argon2 from 'argon2';
// import { v7 as uuidv7 } from 'uuid';
// import { DataSource, In } from 'typeorm';
//
// import { Permission } from '../../../modules/authorization/entities/permissions.entity';
// import { Role } from '../../../modules/authorization/entities/roles.entity';
// import { RoleSource } from '../../../modules/authorization/enums/user-role-source.enum';
// import { UserPermission } from '../../../modules/users/permissions/user.permissions';
// import { User } from '../../../modules/users/entities/user.entity';
// import { UserRole } from '../../../modules/users/entities/user-role.entity';
// import { UserStatus } from '../../../modules/users/enums/user-status.enum';
//
// const DEFAULT_TOTAL = 10_000_000;
// const DEFAULT_BATCH_SIZE = 1_000;
// const MAX_BATCH_SIZE = 2_000;
//
// // Quyền đã được đăng ký bởi seedAuthorization().
// // LƯU Ý: user.findAll cho phép xem danh sách user: CHỈ DÙNG DEMO.
// const SHARED_DEMO_PERMISSION_CODES = [
//   UserPermission.READ,
//   UserPermission.FIND_ALL,
// ] as const;
//
// type DemoIdentity = {
//   username: string;
//   email: string;
//   phone: string;
// };
//
// function readPositiveInt(
//   name: string,
//   fallback: number,
//   maximum: number,
// ): number {
//   const raw = process.env[name];
//   if (raw === undefined || raw.trim() === '') return fallback;
//
//   const value = Number(raw);
//   if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
//     throw new Error(`${name} phải là số nguyên từ 1 đến ${maximum}`);
//   }
//   return value;
// }
//
// function makeIdentity(sequence: number): DemoIdentity {
//   // sequence được sinh tuần tự, không ngẫu nhiên; không bao giờ trùng nhau
//   // trong cùng một phạm vi seed.
//   const suffix = String(sequence).padStart(8, '0');
//   const username = `seed10m_${suffix}`;
//
//   return {
//     username,
//     email: `${username}@example.invalid`,
//     // +999 là tiền tố thử nghiệm; không dùng để gửi SMS/cuộc gọi thực.
//     phone: `+999${String(sequence).padStart(12, '0')}`,
//   };
// }
//
// async function ensureRole(
//   dataSource: DataSource,
//   code: string,
//   name: string,
//   source: RoleSource,
//   level: number,
// ): Promise<Role> {
//   const repository = dataSource.getRepository(Role);
//   const existing = await repository.findOne({
//     where: { code },
//     relations: { permissions: true },
//   });
//
//   if (existing) return existing;
//
//   return repository.save(
//     repository.create({
//       code,
//       name,
//       source,
//       permissions: [],
//       level: level,
//     }),
//   );
// }
//
// async function prepareRoles(dataSource: DataSource): Promise<Role> {
//   const roleRepository = dataSource.getRepository(Role);
//   const permissionRepository = dataSource.getRepository(Permission);
//
//   const permissionCodes = [...SHARED_DEMO_PERMISSION_CODES];
//   const permissions = await permissionRepository.find({
//     where: {
//       code: In(permissionCodes),
//       isActive: true,
//     },
//   });
//
//   const found = new Set(permissions.map(({ code }) => code));
//   const missing = permissionCodes.filter((code) => !found.has(code));
//   if (missing.length) {
//     throw new Error(
//       `Thiếu permission: ${missing.join(', ')}. Phải chạy seedAuthorization() trước.`,
//     );
//   }
//
//   const userRole = await ensureRole(
//     dataSource,
//     'USER',
//     'Người dùng mặc định',
//     RoleSource.SYSTEM,
//     2,
//   );
//
//   // Nếu đã tồn tại USER với đặc quyền, không tự động trao những quyền đó
//   // cho 10 triệu tài khoản thử nghiệm.
//   if (userRole.permissions?.length) {
//     throw new Error(
//       'Role USER đã có permission. Hãy kiểm tra quyền trước khi gán mặc định cho 10 triệu user.',
//     );
//   }
//
//   for (const [code, name] of [
//     ['EDITOR', 'Biên tập viên (demo)'],
//     ['SALE', 'Nhân viên bán hàng (demo)'],
//   ] as const) {
//     const role = await ensureRole(dataSource, code, name, RoleSource.CUSTOM, 2);
//
//     if (role.source === RoleSource.SYSTEM) {
//       throw new Error(
//         `Role ${code} đang là SYSTEM: không tự động thay đổi quyền.`,
//       );
//     }
//
//     // Chỉ thêm 2 quyền demo; không xóa quyền đã được cấp trước đó.
//     const byId = new Map(
//       [...(role.permissions ?? []), ...permissions].map((item) => [
//         item.id,
//         item,
//       ]),
//     );
//     role.permissions = [...byId.values()];
//     await roleRepository.save(role);
//   }
//
//   return userRole;
// }
//
// /**
//  * Có thể gọi từ run-seed.ts sau seedAuthorization và seedBootstrapAdmin.
//  * Tạo chính xác các identity từ 1..TOTAL; không tạo trùng username/email/phone.
//  * Các identity đã tồn tại chỉ được tái sử dụng khi cả ba trường khớp nhau.
//  *
//  * Trạng thái INACTIVE; mật khẩu là bí mật ngẫu nhiên KHÔNG được xuất ra.
//  * Không dùng bộ dữ liệu này để thử đăng nhập từng user.
//  */
// export async function seedTenMillionDemoUsers(
//   dataSource: DataSource,
// ): Promise<void> {
//   if (process.env.SEED_DEMO_10M !== 'true') {
//     console.info('[demo-users] Bỏ qua (SEED_DEMO_10M != true).');
//     return;
//   }
//
//   if (process.env.NODE_ENV === 'production') {
//     throw new Error(
//       'Không cho phép seed 10 triệu user trong NODE_ENV=production.',
//     );
//   }
//
//   if (!dataSource.isInitialized) {
//     throw new Error('DataSource chưa initialize.');
//   }
//
//   const total = readPositiveInt(
//     'SEED_DEMO_USERS_COUNT',
//     DEFAULT_TOTAL,
//     DEFAULT_TOTAL,
//   );
//   const batchSize = readPositiveInt(
//     'SEED_DEMO_BATCH_SIZE',
//     DEFAULT_BATCH_SIZE,
//     MAX_BATCH_SIZE,
//   );
//
//   const defaultRole = await prepareRoles(dataSource);
//   const passwordHash = await argon2.hash(randomBytes(32).toString('hex'), {
//     type: argon2.argon2id,
//   });
//
//   let newUsersCount = 0;
//   let done = 0;
//   const startedAt = Date.now();
//
//   for (let first = 1; first <= total; first += batchSize) {
//     const last = Math.min(first + batchSize - 1, total);
//     const identities: DemoIdentity[] = [];
//     for (let n = first; n <= last; n += 1) {
//       identities.push(makeIdentity(n));
//     }
//
//     const insertedCount = await dataSource.transaction(async (manager) => {
//       const usersRepo = manager.getRepository(User);
//       const userRolesRepo = manager.getRepository(UserRole);
//
//       // SELECT theo UNIQUE(username), không tải toàn bộ bảng vào bộ nhớ.
//       const existing = await usersRepo.find({
//         where: { username: In(identities.map((user) => user.username)) },
//         select: { id: true, username: true, email: true, phone: true },
//       });
//       const byUsername = new Map(existing.map((user) => [user.username, user]));
//
//       const toInsert: User[] = [];
//       for (const identity of identities) {
//         const present = byUsername.get(identity.username);
//         if (present) {
//           // Không bao giờ chiếm dụng user trùng username nhưng khác thông tin.
//           if (
//             present.email !== identity.email ||
//             present.phone !== identity.phone
//           ) {
//             throw new Error(
//               `Username ${identity.username} đã tồn tại nhưng email/phone không khớp.`,
//             );
//           }
//           continue;
//         }
//
//         toInsert.push(
//           usersRepo.create({
//             id: uuidv7(),
//             username: identity.username,
//             email: identity.email,
//             phone: identity.phone,
//             firstName: 'Demo',
//             lastName: 'User',
//             passwordHash,
//             status: UserStatus.INACTIVE,
//           }),
//         );
//       }
//
//       // Cố ý KHÔNG dùng INSERT IGNORE cho users: collision trên email/phone
//       // phải báo lỗi, không được âm thầm bỏ qua bản ghi.
//       if (toInsert.length) {
//         await usersRepo.insert(toInsert);
//       }
//
//       // Liên kết role mặc định cho cả user mới và user seed đã có.
//       const userRoles = [...existing, ...toInsert].map((user) => ({
//         userId: user.id,
//         roleId: defaultRole.id,
//       }));
//
//       // Chỉ IGNORE bản ghi trùng PK (user_id, role_id) của bảng nối.
//       // Cả hai ID đều được lấy từ entity đã tồn tại/tạo trong transaction.
//       await userRolesRepo
//         .createQueryBuilder()
//         .insert()
//         .into(UserRole)
//         .values(userRoles)
//         .orIgnore()
//         .execute();
//
//       return toInsert.length;
//     });
//
//     newUsersCount += insertedCount;
//     done += identities.length;
//
//     if (done % 50_000 === 0 || done === total) {
//       const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
//       console.info(
//         `[demo-users] ${done.toLocaleString('en-US')}/${total.toLocaleString('en-US')}` +
//           ` | mới: ${newUsersCount.toLocaleString('en-US')}` +
//           ` | ${durationSeconds}s`,
//       );
//     }
//   }
//
//   console.info(
//     `[demo-users] Hoàn tất: ${total.toLocaleString('en-US')} identity,` +
//       ` thêm ${newUsersCount.toLocaleString('en-US')} user.` +
//       ' Các user mới có role USER và trạng thái INACTIVE.',
//   );
// }
/**
 * Place at: src/database/seed/data-test/demo-hierarchy-1000.seed.ts
 * Run from project root:
 *   npx ts-node src/database/seed/data-test/demo-hierarchy-1000.seed.ts
 *
 * Safety: NODE_ENV=development|test, SEED_DEMO_1000=true,
 * DEMO_1000_DB=<DB_DATABASE>, DEMO_1000_PASSWORD=<strong demo password>.
 * The CLI reuses existing seedAuthorization() and seedBootstrapAdmin().
 * Do NOT use npm run init (it currently drops the database).
 *
 * Creates exactly 1,000 new demo accounts in 10 hierarchy branches:
 *  - 10 DEMO_MANAGER (level 80)
 *  - 40 DEMO_SUPERVISOR (level 60)
 *  - 200 DEMO_EDITOR (level 40)
 *  - 750 DEMO_VIEWER (level 20)
 * ADMIN (level 100) is the preexisting bootstrap root, NOT one of the 1,000.
 * All demo accounts are ACTIVE for auth/authorization tests ONLY in test DB.
 * Password is shared across demo accounts from an environment variable.
 * Existing non-demo roles/users are never overwritten.
 * Rerun validates identity, role, parent and all closure paths before skipping.
 */

import 'dotenv/config';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { DataSource, EntityManager, In } from 'typeorm';

import dataSource from '../../data-source';
import { seedAuthorization } from '../authorization.seed';
import { seedBootstrapAdmin } from '../init-admin';
import { User } from '../../../modules/users/entities/user.entity';
import { UserRole } from '../../../modules/users/entities/user-role.entity';
import { UserClosure } from '../../../modules/users/entities/user-closure.entity';
import { UserStatus } from '../../../modules/users/enums/user-status.enum';
import { Role } from '../../../modules/authorization/entities/roles.entity';
import { Permission } from '../../../modules/authorization/entities/permissions.entity';
import { RoleSource } from '../../../modules/authorization/enums/user-role-source.enum';
import { UserPermission } from '../../../modules/users/permissions/user.permissions';

type RoleCode =
  'DEMO_MANAGER' | 'DEMO_SUPERVISOR' | 'DEMO_EDITOR' | 'DEMO_VIEWER';

type RoleSpec = {
  code: RoleCode;
  name: string;
  level: number;
  permissions: readonly string[];
};

const ROLE_SPECS: readonly RoleSpec[] = [
  {
    code: 'DEMO_MANAGER',
    name: 'Demo - Quản lý',
    level: 80,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.CREATE,
      UserPermission.UPDATE,
    ],
  },
  {
    code: 'DEMO_SUPERVISOR',
    name: 'Demo - Giám sát',
    level: 60,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
      UserPermission.CREATE,
    ],
  },
  {
    code: 'DEMO_EDITOR',
    name: 'Demo - Biên tập',
    level: 40,
    permissions: [
      UserPermission.FIND_ALL,
      UserPermission.FIND_ONE,
      UserPermission.READ,
    ],
  },
  {
    code: 'DEMO_VIEWER',
    name: 'Demo - Chỉ xem',
    level: 20,
    permissions: [UserPermission.FIND_ONE, UserPermission.READ],
  },
];

type DemoSpec = {
  sequence: number;
  branch: number;
  parentSequence: number; // 0 means bootstrap ADMIN
  roleCode: RoleCode;
};

type AncestryPath = { ancestorId: string; descendantId: string; depth: number };

type DemoAccount = {
  id: string;
  username: string;
  email: string;
  phone: string;
  parentId: string;
  roleId: string;
  status: UserStatus;
};

function assertSafeEnvironment(): string {
  const mode = 'development';
  const dbName = process.env.DB_DATABASE;
  const DEMO_1000_DB = 'sale_demo';
  const DEMO_1000_PASSWORD = 'DemoOnly_2026_Strong!';
  const SEED_DEMO_1000 = 'true';
  // if (mode !== 'development' && mode !== 'test') {
  //   throw new Error('Refusing demo seed: NODE_ENV must be development or test');
  // }
  // if (SEED_DEMO_1000 !== 'true') {
  //   throw new Error('Refusing demo seed: set SEED_DEMO_1000=true explicitly');
  // }
  // if (!dbName || DEMO_1000_DB !== dbName) {
  //   throw new Error('Refusing demo seed: DEMO_1000_DB must equal DB_DATABASE');
  // }
  const password = DEMO_1000_PASSWORD;
  if (!password || password.length < 16 || password.length > 255) {
    throw new Error('DEMO_1000_PASSWORD must be 16..255 characters');
  }
  if (!process.env.BOOTSTRAP_ADMIN_USERNAME) {
    throw new Error('BOOTSTRAP_ADMIN_USERNAME is required');
  }
  return password;
}

function plan(): DemoSpec[] {
  const specs: DemoSpec[] = [];
  // 10 managers under bootstrap ADMIN.
  for (let manager = 0; manager < 10; manager++) {
    const managerSequence = manager + 1;
    specs.push({
      sequence: managerSequence,
      parentSequence: 0,
      roleCode: 'DEMO_MANAGER',
      branch: manager,
    });
    // 4 supervisors per manager; 40 total.
    for (let s = 0; s < 4; s++) {
      const supervisorIndex = manager * 4 + s;
      const supervisorSequence = 11 + supervisorIndex;
      specs.push({
        sequence: supervisorSequence,
        parentSequence: managerSequence,
        roleCode: 'DEMO_SUPERVISOR',
        branch: manager,
      });
      // 5 editors per supervisor; 200 total.
      for (let e = 0; e < 5; e++) {
        const editorIndex = supervisorIndex * 5 + e;
        specs.push({
          sequence: 51 + editorIndex,
          parentSequence: supervisorSequence,
          roleCode: 'DEMO_EDITOR',
          branch: manager,
        });
      }
    }
  }
  // 750 viewers shared across 200 editors:
  // first 150 editors have 4; remaining 50 have 3.
  for (let v = 0; v < 750; v++) {
    const editorIndex = v % 200;
    specs.push({
      sequence: 251 + v,
      parentSequence: 51 + editorIndex,
      roleCode: 'DEMO_VIEWER',
      branch: Math.floor(editorIndex / 20),
    });
  }
  if (
    specs.length !== 1000 ||
    new Set(specs.map((x) => x.sequence)).size !== 1000
  ) {
    throw new Error(
      'Internal error: demo plan must contain 1,000 distinct users',
    );
  }
  return specs;
}

function identity(sequence: number) {
  const username = `hier1000_${String(sequence).padStart(4, '0')}`;
  return {
    username,
    email: `${username}@example.invalid`,
    phone: `+99977${String(sequence).padStart(13, '0')}`,
  };
}

function sameStrings(a: readonly string[], b: readonly string[]): boolean {
  return (
    a.length === b.length &&
    [...a].sort().every((v, i) => v === [...b].sort()[i])
  );
}

async function ensureDemoRoles(ds: DataSource): Promise<Map<RoleCode, Role>> {
  const roles = ds.getRepository(Role);
  const permissions = ds.getRepository(Permission);
  const codes = [...new Set(ROLE_SPECS.flatMap((x) => [...x.permissions]))];
  const foundPermissions = await permissions.find({
    where: { code: In(codes), isActive: true },
  });
  const byCode = new Map(foundPermissions.map((p) => [p.code, p]));
  for (const code of codes) {
    if (!byCode.has(code)) {
      throw new Error(
        `Permission missing or inactive: ${code}. Run seedAuthorization first.`,
      );
    }
  }

  const result = new Map<RoleCode, Role>();
  for (const spec of ROLE_SPECS) {
    let role = await roles.findOne({
      where: { code: spec.code },
      relations: { permissions: true },
    });
    if (!role) {
      role = await roles.save(
        roles.create({
          code: spec.code,
          name: spec.name,
          level: spec.level,
          source: RoleSource.CUSTOM,
          permissions: spec.permissions.map((c) => byCode.get(c)!),
        }),
      );
    } else {
      // Never silently increase or overwrite permissions on a real existing role.
      const actualCodes = role.permissions.map((p) => p.code);
      if (
        role.level !== spec.level ||
        role.source !== RoleSource.CUSTOM ||
        !sameStrings(actualCodes, spec.permissions)
      ) {
        throw new Error(
          `Existing role ${spec.code} differs from demo policy; refusing to modify it`,
        );
      }
    }
    result.set(spec.code, role);
  }
  return result;
}

async function ensureRoot(ds: DataSource): Promise<User> {
  const username = process.env.BOOTSTRAP_ADMIN_USERNAME!.trim();
  const root = await ds.getRepository(User).findOneBy({ username });
  if (!root || root.status !== UserStatus.ACTIVE || root.parentId != null) {
    throw new Error(
      'Bootstrap ADMIN must exist, be ACTIVE and have parent_id=NULL',
    );
  }
  const adminRole = await ds.getRepository(Role).findOneBy({ code: 'ADMIN' });
  if (
    !adminRole ||
    adminRole.level !== 100 ||
    !(await ds
      .getRepository(UserRole)
      .existsBy({ userId: root.id, roleId: adminRole.id }))
  ) {
    throw new Error('Bootstrap account must hold ADMIN role at level 100');
  }
  await ds.transaction(async (manager) => {
    const closure = manager.getRepository(UserClosure);
    const paths = await closure.find({ where: { descendantId: root.id } });
    if (paths.length === 0) {
      const referencingPaths = await closure.count({
        where: { ancestorId: root.id },
      });
      if (referencingPaths !== 0) {
        throw new Error(
          'Bootstrap hierarchy has descendants but no self-path; repair manually',
        );
      }
      await closure.insert({
        ancestorId: root.id,
        descendantId: root.id,
        depth: 0,
      });
    } else if (
      paths.length !== 1 ||
      paths[0].ancestorId !== root.id ||
      paths[0].depth !== 0
    ) {
      throw new Error(
        'Bootstrap ADMIN has unexpected ancestor paths; refusing to change hierarchy',
      );
    }
  });
  return root;
}

async function upsertDemoUser(
  manager: EntityManager,
  spec: DemoSpec,
  parentId: string,
  role: Role,
  passwordHash: string,
): Promise<{ id: string; inserted: boolean }> {
  const users = manager.getRepository(User);
  const userRoles = manager.getRepository(UserRole);
  const closures = manager.getRepository(UserClosure);
  const details = identity(spec.sequence);

  const parentPaths = await closures.find({
    where: { descendantId: parentId },
  });
  if (!parentPaths.some((p) => p.ancestorId === parentId && p.depth === 0)) {
    throw new Error(`Parent ${parentId} lacks self-path; aborting`);
  }
  const expectedWithoutSelf = parentPaths.map((p) => ({
    ancestorId: p.ancestorId,
    depth: p.depth + 1,
  }));
  const existing = await users.findOneBy({ username: details.username });
  if (existing) {
    if (
      existing.parentId !== parentId ||
      existing.email !== details.email ||
      existing.phone !== details.phone ||
      existing.status !== UserStatus.ACTIVE
    ) {
      throw new Error(
        `Existing ${details.username} has different identity, parent or status`,
      );
    }
    const roleAssignments = await userRoles.find({
      where: { userId: existing.id },
    });
    if (roleAssignments.length !== 1 || roleAssignments[0].roleId !== role.id) {
      throw new Error(
        `Existing ${details.username} has different role assignments`,
      );
    }
    const paths = await closures.find({ where: { descendantId: existing.id } });
    const expected = [
      ...expectedWithoutSelf,
      { ancestorId: existing.id, depth: 0 },
    ];
    if (
      paths.length !== expected.length ||
      expected.some(
        (p) =>
          !paths.some(
            (x) => x.ancestorId === p.ancestorId && x.depth === p.depth,
          ),
      )
    ) {
      throw new Error(
        `Existing ${details.username} has inconsistent closure paths`,
      );
    }
    return { id: existing.id, inserted: false };
  }

  const user = await users.save(
    users.create({
      id: uuidv7(),
      ...details,
      firstName: 'Demo',
      lastName: spec.roleCode.replace('DEMO_', ''),
      passwordHash,
      status: UserStatus.ACTIVE,
      parentId,
    }),
  );
  await userRoles.insert({ userId: user.id, roleId: role.id });
  await closures.insert([
    ...expectedWithoutSelf.map((p) => ({
      ancestorId: p.ancestorId,
      descendantId: user.id,
      depth: p.depth,
    })),
    { ancestorId: user.id, descendantId: user.id, depth: 0 },
  ]);
  return { id: user.id, inserted: true };
}

/** Idempotent at the branch level: either all of a manager's branch commits or none. */
export async function seedDemoHierarchy1000(ds: DataSource): Promise<void> {
  const demoPassword = assertSafeEnvironment();
  if (!ds.isInitialized) throw new Error('DataSource must be initialized');

  const root = await ensureRoot(ds);
  const roles = await ensureDemoRoles(ds);
  const specs = plan();
  const hash = await argon2.hash(demoPassword, { type: argon2.argon2id });
  let inserted = 0;
  let skipped = 0;

  for (let branch = 0; branch < 10; branch++) {
    const group = specs.filter((s) => s.branch === branch);
    // Group order is managers, supervisors, editors, viewers, so parent always exists.
    const result = await ds.transaction(async (manager) => {
      const resolved = new Map<number, string>([[0, root.id]]);
      let createdInBranch = 0;
      for (const spec of group) {
        const parentId = resolved.get(spec.parentSequence);
        const role = roles.get(spec.roleCode);
        if (!parentId || !role)
          throw new Error(`Unresolved parent/role for ${spec.sequence}`);
        const saved = await upsertDemoUser(manager, spec, parentId, role, hash);
        resolved.set(spec.sequence, saved.id);
        if (saved.inserted) createdInBranch++;
      }
      return createdInBranch;
    });
    inserted += result;
    skipped += group.length - result;
    console.info(
      `[demo-1000] branch ${branch + 1}/10: ${result} new, ${group.length - result} existing`,
    );
  }

  console.info(
    `[demo-1000] Complete: ${inserted} new, ${skipped} validated existing, total=1000`,
  );
  console.info(
    '[demo-1000] Roles: 10 managers, 40 supervisors, 200 editors, 750 viewers; root=existing ADMIN',
  );
  console.info(
    '[demo-1000] Credentials: DEMO_1000_PASSWORD (not printed). NEVER run against production.',
  );
}

if (require.main === module) {
  (async () => {
    // Check safety switches before making any database connection or running seeders.
    assertSafeEnvironment();
    await dataSource.initialize();
    try {
      await seedAuthorization(dataSource);
      await seedBootstrapAdmin(dataSource);
      await seedDemoHierarchy1000(dataSource);
    } finally {
      await dataSource.destroy();
    }
  })().catch((error) => {
    console.error('[demo-1000] Failed:', error);
    process.exitCode = 1;
  });
}
