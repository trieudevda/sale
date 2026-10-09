import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ErrorCode } from '../../common/exceptions/error-code';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { Permission } from './entities/permissions.entity';
import { Role } from './entities/roles.entity';
import { RoleSource } from './enums/user-role-source.enum';
import { FindAllRoleOptions } from './interface/role.interface';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async findAllRole(options: FindAllRoleOptions = {}) {
    const { ids, relations = {} } = options;
    if (ids) {
      const uniqueIds = [...new Set(ids)];
      const roles = await this.roleRepository.find({
        where: { id: In(uniqueIds) },
      });
      const foundRoleIds = new Set(roles.map((role) => role.id));
      const invalidRoleIds = uniqueIds.filter((id) => !foundRoleIds.has(id));
      if (invalidRoleIds.length > 0) {
        throw new BadRequestException({
          code: ErrorCode.ROLE_NOT_FOUND,
          message: 'Some roles do not exist',
          roleIds: invalidRoleIds,
        });
      }
      return roles;
    }
    return this.roleRepository.find({
      relations,
    });
  }

  // async create(createAuthorizationDto: CreateAuthorizationDto) {
  //   const existing = await this.roleRepository.findOne({
  //     where: { code: createAuthorizationDto.code },
  //   });
  //   if (existing) {
  //     throw new ConflictException({
  //       code: ErrorCode.ROLE_CODE_ALREADY_EXISTS,
  //       message: 'Role code already exists',
  //     });
  //   }
  //
  //   const permissions = await this.resolvePermissions(
  //     createAuthorizationDto.permissionIds ?? [],
  //   );
  //
  //   const role = this.roleRepository.create({
  //     code: createAuthorizationDto.code,
  //     name: createAuthorizationDto.name,
  //     source: RoleSource.CUSTOM,
  //     permissions,
  //   });
  //   return this.roleRepository.save(role);
  // }
  //
  // findAll() {
  //   return this.roleRepository.find({
  //     relations: { permissions: true },
  //     order: { code: 'ASC' },
  //   });
  // }
  //
  // findAllPermissions() {
  //   return this.permissionRepository.find({
  //     where: { isActive: true },
  //     order: { module: 'ASC', code: 'ASC' },
  //   });
  // }
  //
  // async findOne(id: string) {
  //   const role = await this.roleRepository.findOne({
  //     where: { id },
  //     relations: { permissions: true },
  //   });
  //   if (!role) {
  //     throw this.roleNotFound(id);
  //   }
  //   return role;
  // }
  //
  // async update(id: string, updateAuthorizationDto: UpdateAuthorizationDto) {
  //   const role = await this.findOne(id);
  //   this.assertCustomRole(role);
  //
  //   if (
  //     updateAuthorizationDto.code &&
  //     updateAuthorizationDto.code !== role.code
  //   ) {
  //     const existing = await this.roleRepository.findOne({
  //       where: { code: updateAuthorizationDto.code },
  //     });
  //     if (existing) {
  //       throw new ConflictException({
  //         code: ErrorCode.ROLE_CODE_ALREADY_EXISTS,
  //         message: 'Role code already exists',
  //       });
  //     }
  //     role.code = updateAuthorizationDto.code;
  //   }
  //
  //   if (updateAuthorizationDto.name !== undefined) {
  //     role.name = updateAuthorizationDto.name;
  //   }
  //   if (updateAuthorizationDto.permissionIds !== undefined) {
  //     role.permissions = await this.resolvePermissions(
  //       updateAuthorizationDto.permissionIds,
  //     );
  //   }
  //
  //   return this.roleRepository.save(role);
  // }
  //
  // async remove(id: string) {
  //   const role = await this.findOne(id);
  //   this.assertCustomRole(role);
  //   await this.roleRepository.remove(role);
  //   return { id: role.id };
  // }
  //
  // private async resolvePermissions(ids: number[]): Promise<Permission[]> {
  //   if (ids.length === 0) {
  //     return [];
  //   }
  //
  //   const permissions = await this.permissionRepository.find({
  //     where: { id: In(ids), isActive: true },
  //   });
  //   const foundIds = new Set(permissions.map(({ id }) => id));
  //   const missingIds = ids.filter((id) => !foundIds.has(id));
  //   if (missingIds.length > 0) {
  //     throw new BadRequestException({
  //       code: ErrorCode.INVALID_PERMISSION_IDS,
  //       message: 'One or more permission IDs are invalid or inactive',
  //     });
  //   }
  //   return permissions;
  // }
  //
  // private assertCustomRole(role: Role): void {
  //   if (role.source === RoleSource.SYSTEM) {
  //     throw new ConflictException({
  //       code: ErrorCode.SYSTEM_ROLE_IMMUTABLE,
  //       message: 'System roles cannot be modified or deleted',
  //     });
  //   }
  // }
  //
  // private roleNotFound(id: string): NotFoundException {
  //   return new NotFoundException({
  //     code: ErrorCode.ROLE_NOT_FOUND,
  //     message: `Role ${id} was not found`,
  //   });
  // }
}
