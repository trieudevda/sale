/**
 * src/database/seed/demo-users.seed.ts
 *
 * Seed tối đa 10.000.000 user thử nghiệm cho NestJS + TypeORM + MySQL.
 * Chạy SAU seedAuthorization() và seedBootstrapAdmin().
 *
 * Bật bằng SEED_DEMO_10M=true (mặc định tắt).
 * Kiểm thử trước với SEED_DEMO_USERS_COUNT=1000.
 * Mỗi lần chạy lại chỉ bổ sung dữ liệu thiếu, không xóa/sửa user đã có.
 *
 * KHÔNG chạy trong môi trường production.
 */

import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';
import { v7 as uuidv7 } from 'uuid';
import { DataSource, In } from 'typeorm';

import { Permission } from '../../../modules/authorization/entities/permissions.entity';
import { Role } from '../../../modules/authorization/entities/roles.entity';
import { RoleSource } from '../../../modules/authorization/enums/user-role-source.enum';
import { UserPermission } from '../../../modules/users/permissions/user.permissions';
import { User } from '../../../modules/users/entities/user.entity';
import { UserRole } from '../../../modules/users/entities/user-role.entity';
import { UserStatus } from '../../../modules/users/enums/user-status.enum';

const DEFAULT_TOTAL = 10_000_000;
const DEFAULT_BATCH_SIZE = 1_000;
const MAX_BATCH_SIZE = 2_000;

// Quyền đã được đăng ký bởi seedAuthorization().
// LƯU Ý: user.findAll cho phép xem danh sách user: CHỈ DÙNG DEMO.
const SHARED_DEMO_PERMISSION_CODES = [
  UserPermission.READ,
  UserPermission.FIND_ALL,
] as const;

type DemoIdentity = {
  username: string;
  email: string;
  phone: string;
};

function readPositiveInt(
  name: string,
  fallback: number,
  maximum: number,
): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;

  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} phải là số nguyên từ 1 đến ${maximum}`);
  }
  return value;
}

function makeIdentity(sequence: number): DemoIdentity {
  // sequence được sinh tuần tự, không ngẫu nhiên; không bao giờ trùng nhau
  // trong cùng một phạm vi seed.
  const suffix = String(sequence).padStart(8, '0');
  const username = `seed10m_${suffix}`;

  return {
    username,
    email: `${username}@example.invalid`,
    // +999 là tiền tố thử nghiệm; không dùng để gửi SMS/cuộc gọi thực.
    phone: `+999${String(sequence).padStart(12, '0')}`,
  };
}

async function ensureRole(
  dataSource: DataSource,
  code: string,
  name: string,
  source: RoleSource,
  level: number,
): Promise<Role> {
  const repository = dataSource.getRepository(Role);
  const existing = await repository.findOne({
    where: { code },
    relations: { permissions: true },
  });

  if (existing) return existing;

  return repository.save(
    repository.create({
      code,
      name,
      source,
      permissions: [],
      level: level,
    }),
  );
}

async function prepareRoles(dataSource: DataSource): Promise<Role> {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  const permissionCodes = [...SHARED_DEMO_PERMISSION_CODES];
  const permissions = await permissionRepository.find({
    where: {
      code: In(permissionCodes),
      isActive: true,
    },
  });

  const found = new Set(permissions.map(({ code }) => code));
  const missing = permissionCodes.filter((code) => !found.has(code));
  if (missing.length) {
    throw new Error(
      `Thiếu permission: ${missing.join(', ')}. Phải chạy seedAuthorization() trước.`,
    );
  }

  const userRole = await ensureRole(
    dataSource,
    'USER',
    'Người dùng mặc định',
    RoleSource.SYSTEM,
    2,
  );

  // Nếu đã tồn tại USER với đặc quyền, không tự động trao những quyền đó
  // cho 10 triệu tài khoản thử nghiệm.
  if (userRole.permissions?.length) {
    throw new Error(
      'Role USER đã có permission. Hãy kiểm tra quyền trước khi gán mặc định cho 10 triệu user.',
    );
  }

  for (const [code, name] of [
    ['EDITOR', 'Biên tập viên (demo)'],
    ['SALE', 'Nhân viên bán hàng (demo)'],
  ] as const) {
    const role = await ensureRole(dataSource, code, name, RoleSource.CUSTOM, 2);

    if (role.source === RoleSource.SYSTEM) {
      throw new Error(
        `Role ${code} đang là SYSTEM: không tự động thay đổi quyền.`,
      );
    }

    // Chỉ thêm 2 quyền demo; không xóa quyền đã được cấp trước đó.
    const byId = new Map(
      [...(role.permissions ?? []), ...permissions].map((item) => [
        item.id,
        item,
      ]),
    );
    role.permissions = [...byId.values()];
    await roleRepository.save(role);
  }

  return userRole;
}

/**
 * Có thể gọi từ run-seed.ts sau seedAuthorization và seedBootstrapAdmin.
 * Tạo chính xác các identity từ 1..TOTAL; không tạo trùng username/email/phone.
 * Các identity đã tồn tại chỉ được tái sử dụng khi cả ba trường khớp nhau.
 *
 * Trạng thái INACTIVE; mật khẩu là bí mật ngẫu nhiên KHÔNG được xuất ra.
 * Không dùng bộ dữ liệu này để thử đăng nhập từng user.
 */
export async function seedTenMillionDemoUsers(
  dataSource: DataSource,
): Promise<void> {
  if (process.env.SEED_DEMO_10M !== 'true') {
    console.info('[demo-users] Bỏ qua (SEED_DEMO_10M != true).');
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Không cho phép seed 10 triệu user trong NODE_ENV=production.',
    );
  }

  if (!dataSource.isInitialized) {
    throw new Error('DataSource chưa initialize.');
  }

  const total = readPositiveInt(
    'SEED_DEMO_USERS_COUNT',
    DEFAULT_TOTAL,
    DEFAULT_TOTAL,
  );
  const batchSize = readPositiveInt(
    'SEED_DEMO_BATCH_SIZE',
    DEFAULT_BATCH_SIZE,
    MAX_BATCH_SIZE,
  );

  const defaultRole = await prepareRoles(dataSource);
  const passwordHash = await argon2.hash(randomBytes(32).toString('hex'), {
    type: argon2.argon2id,
  });

  let newUsersCount = 0;
  let done = 0;
  const startedAt = Date.now();

  for (let first = 1; first <= total; first += batchSize) {
    const last = Math.min(first + batchSize - 1, total);
    const identities: DemoIdentity[] = [];
    for (let n = first; n <= last; n += 1) {
      identities.push(makeIdentity(n));
    }

    const insertedCount = await dataSource.transaction(async (manager) => {
      const usersRepo = manager.getRepository(User);
      const userRolesRepo = manager.getRepository(UserRole);

      // SELECT theo UNIQUE(username), không tải toàn bộ bảng vào bộ nhớ.
      const existing = await usersRepo.find({
        where: { username: In(identities.map((user) => user.username)) },
        select: { id: true, username: true, email: true, phone: true },
      });
      const byUsername = new Map(existing.map((user) => [user.username, user]));

      const toInsert: User[] = [];
      for (const identity of identities) {
        const present = byUsername.get(identity.username);
        if (present) {
          // Không bao giờ chiếm dụng user trùng username nhưng khác thông tin.
          if (
            present.email !== identity.email ||
            present.phone !== identity.phone
          ) {
            throw new Error(
              `Username ${identity.username} đã tồn tại nhưng email/phone không khớp.`,
            );
          }
          continue;
        }

        toInsert.push(
          usersRepo.create({
            id: uuidv7(),
            username: identity.username,
            email: identity.email,
            phone: identity.phone,
            firstName: 'Demo',
            lastName: 'User',
            passwordHash,
            status: UserStatus.INACTIVE,
          }),
        );
      }

      // Cố ý KHÔNG dùng INSERT IGNORE cho users: collision trên email/phone
      // phải báo lỗi, không được âm thầm bỏ qua bản ghi.
      if (toInsert.length) {
        await usersRepo.insert(toInsert);
      }

      // Liên kết role mặc định cho cả user mới và user seed đã có.
      const userRoles = [...existing, ...toInsert].map((user) => ({
        userId: user.id,
        roleId: defaultRole.id,
      }));

      // Chỉ IGNORE bản ghi trùng PK (user_id, role_id) của bảng nối.
      // Cả hai ID đều được lấy từ entity đã tồn tại/tạo trong transaction.
      await userRolesRepo
        .createQueryBuilder()
        .insert()
        .into(UserRole)
        .values(userRoles)
        .orIgnore()
        .execute();

      return toInsert.length;
    });

    newUsersCount += insertedCount;
    done += identities.length;

    if (done % 50_000 === 0 || done === total) {
      const durationSeconds = Math.round((Date.now() - startedAt) / 1000);
      console.info(
        `[demo-users] ${done.toLocaleString('en-US')}/${total.toLocaleString('en-US')}` +
          ` | mới: ${newUsersCount.toLocaleString('en-US')}` +
          ` | ${durationSeconds}s`,
      );
    }
  }

  console.info(
    `[demo-users] Hoàn tất: ${total.toLocaleString('en-US')} identity,` +
      ` thêm ${newUsersCount.toLocaleString('en-US')} user.` +
      ' Các user mới có role USER và trạng thái INACTIVE.',
  );
}
