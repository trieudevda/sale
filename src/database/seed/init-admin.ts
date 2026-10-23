import * as argon2 from 'argon2';
import { DataSource } from 'typeorm';
import { Role } from '../../modules/authorization/entities/roles.entity';
import { User } from '../../modules/users/entities/user.entity';
import { v7 as uuidv7 } from 'uuid';
import { UserRole } from '../../modules/users/entities/user-role.entity';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === '') {
    throw new Error(`${name} is required`);
  }

  return value;
}

export async function seedBootstrapAdmin(
  dataSource: DataSource,
): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  const username = requireEnv('BOOTSTRAP_ADMIN_USERNAME').trim();
  const phone = requireEnv('BOOTSTRAP_ADMIN_PHONE').trim();
  const password = requireEnv('BOOTSTRAP_ADMIN_PASSWORD');

  if (username.length > 100) {
    throw new Error('BOOTSTRAP_ADMIN_USERNAME must not exceed 100 characters');
  }

  if (!/^\+?[0-9]{9,20}$/.test(phone)) {
    throw new Error('BOOTSTRAP_ADMIN_PHONE is invalid');
  }

  if (password.length < 10 || password.length > 255) {
    throw new Error(
      'BOOTSTRAP_ADMIN_PASSWORD must contain between 10 and 255 characters',
    );
  }

  const adminRole = await roleRepository.findOneBy({
    code: 'ADMIN',
  });

  if (!adminRole) {
    throw new Error('ADMIN role does not exist');
  }

  const existingByUsername = await userRepository.findOne({
    where: { username },
  });

  if (existingByUsername) {
    if (existingByUsername.phone !== phone) {
      throw new Error(
        'Bootstrap admin username already belongs to another phone',
      );
    }
    await dataSource
      .getRepository(UserRole)
      .createQueryBuilder()
      .insert()
      .values({
        userId: existingByUsername.id,
        roleId: adminRole.id,
      })
      .orIgnore()
      .execute();

    return;
  }

  const existingByPhone = await userRepository.findOneBy({
    phone,
  });

  if (existingByPhone) {
    throw new Error('Bootstrap admin phone already belongs to another user');
  }

  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
  });
  await dataSource.transaction(async (manager) => {
    const admin = manager.getRepository(User).create({
      id: uuidv7(),
      username,
      phone,
      passwordHash,
    });

    await manager.getRepository(User).save(admin);

    await manager.getRepository(UserRole).insert({
      userId: admin.id,
      roleId: adminRole.id,
    });
  });
}
