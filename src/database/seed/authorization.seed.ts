import { DataSource, In } from 'typeorm';
import { UserPermission } from '../../modules/users/permissions/user.permissions';
import { Permission } from '../../modules/authorization/entities/permissions.entity';
import { Role } from '../../modules/authorization/entities/roles.entity';
import { DEFAULT_ROLES } from './default-roles.config';
import { RoleSource } from '../../modules/authorization/enums/user-role-source.enum';
import { User } from '../../modules/users/entities/user.entity';
import { UsersService } from '../../modules/users/users.service';
import * as argon2 from 'argon2';
import { NotFoundException } from '@nestjs/common';
import { ErrorCode } from '../../common/exceptions/error-code';

export const PERMISSION_REGISTRY = {
  user: UserPermission,
} as const;

export async function seedAuthorization(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const permissionRepository = dataSource.getRepository(Permission);
  const roleRepository = dataSource.getRepository(Role);
  /*
   * 1. Sync permissions
   */
  for (const [moduleName, permissions] of Object.entries(PERMISSION_REGISTRY)) {
    for (const code of Object.values(permissions)) {
      let permission = await permissionRepository.findOneBy({ code });

      if (!permission) {
        permission = permissionRepository.create({
          code,
          module: moduleName,
          isActive: true,
        });
      } else {
        permission.module = moduleName;
        permission.isActive = true;
      }
      await permissionRepository.save(permission);
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

    role.permissions = config.grantAllPermissions
      ? await permissionRepository.find({
          where: { isActive: true },
        })
      : await permissionRepository.find({
          where: {
            code: In([...config.permissions]),
            isActive: true,
          },
        });

    await roleRepository.save(role);
  }
}
