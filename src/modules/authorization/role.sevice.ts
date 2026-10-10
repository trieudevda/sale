import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ErrorCode } from '../../common/exceptions/error-code';
import { Role } from './entities/roles.entity';
import { FindAllRoleOptions } from './interface/role.interface';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async findAllRole(options: FindAllRoleOptions = {}) {
    const { ids, relations = {} } = options;
    if (ids?.length) {
      if (ids.length === 0) {
        return [];
      }
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
}
