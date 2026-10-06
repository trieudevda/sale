import { DataSource, In } from 'typeorm';
import { UserPermission } from '../../modules/users/user.permissions';
import { Permission } from '../../modules/authorization/entities/permissions.entity';
import { Role } from '../../modules/authorization/entities/roles.entity';
import { DEFAULT_ROLES } from './default-roles.config';
import { RoleSource } from '../../modules/authorization/enums/user-role-source.enum';
// import { RoleSource } from '../enums/user-role-source.enum';

export const PERMISSION_REGISTRY = {
  user: UserPermission,
} as const;

export async function seedAuthorization(dataSource: DataSource): Promise<void> {
  const permissionRepository = dataSource.getRepository(Permission);

  const roleRepository = dataSource.getRepository(Role);

  /*
   * 1. Sync permissions
   */
  for (const [moduleName, permissions] of Object.entries(PERMISSION_REGISTRY)) {
    for (const code of Object.values(permissions)) {
      await permissionRepository.upsert(
        {
          code,
          module: moduleName,
          isActive: true,
        },
        {
          conflictPaths: ['code'],
        },
      );
    }
  }

  /*
   * 2. Create / update default roles
   */
  for (const config of DEFAULT_ROLES) {
    let role = await roleRepository.findOne({
      where: {
        code: config.code,
      },
      relations: {
        permissions: true,
      },
    });

    if (!role) {
      role = roleRepository.create({
        code: config.code,
        name: config.name,
        source: RoleSource.SYSTEM,
      });
    } else {
      role.name = config.name;
      role.source = RoleSource.SYSTEM;
    }

    role.permissions = await permissionRepository.find({
      where: {
        code: In([...config.permissions]),
      },
    });

    await roleRepository.save(role);
  }
}
