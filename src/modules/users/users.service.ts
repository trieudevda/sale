import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import CreateUserDto from './dto/create-user.dto';
import {
  Brackets,
  DataSource,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ErrorCode } from '../../common/exceptions/error-code';
import { UserStatus } from './enums/user-status.enum';
import { FindUsersQueryDto } from './dto/find-user-query.dto';
import { v7 as uuidv7 } from 'uuid';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { uuidV7ToBuffer } from '../../database/uuid-v7';
import { UserClosure } from './entities/user-closure.entity';
import { Role } from '../authorization/entities/roles.entity';
import { UserRole } from './entities/user-role.entity';
import { UserPermission } from './permissions/user.permissions';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto, actorId: string) {
    const { password, ...userData } = createUserDto;
    const passwordHash = await this.hashPassword(password);
    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const closures = manager.getRepository(UserClosure);
      const userRoles = manager.getRepository(UserRole);

      const actor = await users.findOne({
        where: { id: actorId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!actor || actor.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('Inactive account');
      }
      const assignments = await userRoles.find({
        where: { userId: actorId },
        relations: {
          role: {
            permissions: true,
          },
        },
      });
      const canCreate = assignments.some((item) =>
        item.role.permissions.some(
          (permission) =>
            permission.isActive && permission.code === UserPermission.CREATE,
        ),
      );
      if (!canCreate) {
        throw new ForbiddenException('Cannot create users');
      }
      const ancestors = await closures.find({
        where: { descendantId: actorId },
      });

      if (
        !ancestors.some(
          (path) => path.ancestorId === actorId && path.depth === 0,
        )
      ) {
        throw new ConflictException('Hierarchy is not initialized');
      }
      const child = users.create({
        id: uuidv7(),
        ...userData,
        passwordHash,
        status: UserStatus.PENDING,
        parentId: actorId,
        createdBy: actorId,
      });

      const saved = await users.save(child);
      await closures.insert([
        ...ancestors.map((path) => ({
          ancestorId: path.ancestorId,
          descendantId: saved.id,
          depth: path.depth + 1,
        })),
        {
          ancestorId: saved.id,
          descendantId: saved.id,
          depth: 0,
        },
      ]);
      return {
        id: saved.id,
        username: saved.username,
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: saved.email,
        phone: saved.phone,
        status: saved.status,
        parentId: saved.parentId,
        createdBy: saved.createdBy,
      };
    });
  }
  async findAll(query: FindUsersQueryDto, actorId: string) {
    const { q, page, limit, sort, roleId, status } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      // .leftJoinAndSelect('users.roles', 'roles')
      .leftJoinAndSelect('users.roleAssignments', 'assignments')
      .leftJoinAndSelect('assignments.role', 'roles')
      .select([
        'users.id',
        'users.firstName',
        'users.lastName',
        'users.email',
        'users.phone',
        'users.username',
        'users.status',
        'users.createdAt',
        'users.updatedAt',
        'assignments.userId',
        'assignments.roleId',
        'roles.id',
        'roles.code',
        'roles.name',
      ])
      .where('1 = 1');
    if (status !== undefined) {
      queryBuilder.where('users.status = :status', { status });
    }
    queryBuilder.where('users.status = :status', { status }).andWhere(
      `EXISTS (
                SELECT 1
                FROM user_closure uc
                WHERE uc.ancestor_id = :scopeActorId
                  AND uc.descendant_id = users.id
              )`,
      {
        scopeActorId: uuidV7ToBuffer(actorId),
      },
    );

    if (q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('users.username LIKE :keyword')
            .orWhere('users.email LIKE :keyword')
            .orWhere('users.phone LIKE :keyword')
            .orWhere('users.first_name LIKE :keyword')
            .orWhere('users.last_name LIKE :keyword')
            .orWhere(
              `CONCAT_WS(
              ' ',
              users.first_name,
              users.last_name
            ) LIKE :keyword`,
            );
        }),
      );

      queryBuilder.setParameter('keyword', `%${q}%`);
    }

    if (roleId) {
      queryBuilder.innerJoin(
        'users.roleAssignments',
        'filterAssignment',
        'filterAssignment.roleId = :roleId',
        { roleId },
      );
    }

    switch (sort) {
      case 'oldest':
        queryBuilder.orderBy('users.createdAt', 'ASC');
        break;

      case 'username_asc':
        queryBuilder.orderBy('users.username', 'ASC');
        break;

      case 'username_desc':
        queryBuilder.orderBy('users.username', 'DESC');
        break;

      case 'name_asc':
        queryBuilder
          .orderBy('users.firstName', 'ASC')
          .addOrderBy('users.lastName', 'ASC');
        break;

      case 'name_desc':
        queryBuilder
          .orderBy('users.firstName', 'DESC')
          .addOrderBy('users.lastName', 'DESC');
        break;

      case 'newest':
      default:
        queryBuilder.orderBy('users.createdAt', 'DESC');
        break;
    }

    // Giữ thứ tự ổn định nếu nhiều user có cùng giá trị sort.
    queryBuilder.addOrderBy('users.id', 'DESC');

    queryBuilder.skip((page - 1) * limit).take(limit);
    const [users, total] = await queryBuilder.getManyAndCount();
    const items = users.map((user) => {
      const { roleAssignments, ...data } = user;

      return {
        ...data,
        roles: roleAssignments.map((item) => ({
          id: item.role.id,
          code: item.role.code,
          name: item.role.name,
        })),
      };
    });
    return {
      items: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username,
      },
      // relations: {
      //   roles: true,
      // },
      select: {
        id: true,
        username: true,
        passwordHash: true,
        status: true,
        authVersion: true,
      },
    });
  }
  findAuthStateById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        username: true,
        status: true,
        authVersion: true,
      },
    });
  }
  async findPrincipalById(id: string) {
    return this.userRepository.findOne({
      where: { id },
      relations: {
        roleAssignments: {
          role: {
            permissions: true,
          },
        },
      },
    });
  }

  async revokeAllRefreshTokens(userId: string): Promise<void> {
    const result = await this.userRepository.increment(
      { id: userId },
      'authVersion',
      1,
    );

    if (!result.affected) {
      throw new UnauthorizedException('User not found');
    }
  }

  async findOne(id: string, actorId: string) {
    if (id !== actorId) {
      throw new NotFoundException('User not found');
    }

    const user = await this.userRepository
      .createQueryBuilder('users')
      .innerJoinAndSelect('users.roleAssignments', 'roleAssignments')
      .where('users.id = :id', { id: uuidV7ToBuffer(id) })
      // .where('users.id = :id', { id: uuidV7ToBuffer(id) })
      .andWhere(
        `EXISTS (
      SELECT 1
      FROM user_closure uc
      WHERE uc.ancestor_id = :scopeActorId
        AND uc.descendant_id = users.id
    )`,
        {
          scopeActorId: uuidV7ToBuffer(actorId),
        },
      )
      .getOne();
    // const user = await this.userRepository.findOne({
    //   where: { id },
    //   select: {
    //     id: true,
    //     username: true,
    //     firstName: true,
    //     lastName: true,
    //     email: true,
    //     phone: true,
    //     status: true,
    //     createdAt: true,
    //     updatedAt: true,
    //   },
    // });
console.log('user', user);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      status: user.status,
      roleAssignments: user.roleAssignments.map((item) => ({
        roleId: item.roleId,
        userId: item.userId,
        user: item.user || undefined,
        role: item.role || undefined
      })),
    };
  }

  async update(actorId: string, targetId: string, dto: UpdateUserProfileDto) {
    if (actorId !== targetId) {
      throw new NotFoundException('User not found');
    }
    return this.dataSource.transaction(async (manager) => {
      const repository = manager.getRepository(User);

      const user = await repository.findOne({
        where: { id: actorId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('Account is not active');
      }

      const patch: Partial<User> = {};

      if (dto.firstName !== undefined) patch.firstName = dto.firstName;
      if (dto.lastName !== undefined) patch.lastName = dto.lastName;
      if (dto.address !== undefined) patch.address = dto.address;

      if (dto.email !== undefined && dto.email !== user.email) {
        patch.email = dto.email;
        patch.emailVerifiedAt = null;
      }

      if (dto.phone !== undefined && dto.phone !== user.phone) {
        patch.phone = dto.phone;
        patch.phoneVerifiedAt = null;
      }

      if (Object.keys(patch).length > 0) {
        await repository.update({ id: actorId }, patch);
      }

      Object.assign(user, patch);

      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        email: user.email,
        phone: user.phone,
        status: user.status,
      };
    });
  }

  async changeOwnPassword(
    actorId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different');
    }

    const user = await this.userRepository.findOne({
      where: { id: actorId },
      select: {
        id: true,
        passwordHash: true,
        authVersion: true,
        status: true,
      },
    });

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !(await this.verifyPassword(user.passwordHash, currentPassword))
    ) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await this.hashPassword(newPassword);

    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({
        passwordHash: newHash,
        authVersion: () => 'auth_version + 1',
      })
      .where('id = :id', {
        id: uuidV7ToBuffer(actorId),
      })
      .andWhere('auth_version = :version', {
        version: user.authVersion,
      })
      .andWhere('status = :status', {
        status: UserStatus.ACTIVE,
      })
      .execute();

    if (result.affected !== 1) {
      throw new ConflictException('Account changed, retry the request');
    }
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,
    });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    return argon2.verify(hash, password);
  }

  async activateChild(actorId: string, targetId: string, roleIds: string[]) {
    if (actorId === targetId) {
      throw new ForbiddenException('Cannot activate yourself');
    }

    return this.dataSource.transaction(async (manager) => {
      const users = manager.getRepository(User);
      const assignments = manager.getRepository(UserRole);

      const actor = await users.findOne({
        where: { id: actorId },
        lock: { mode: 'pessimistic_write' },
      });

      const target = await users.findOne({
        where: { id: targetId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!actor || actor.status !== UserStatus.ACTIVE) {
        throw new ForbiddenException('Inactive account');
      }

      if (
        !target ||
        target.parentId !== actorId ||
        target.createdBy !== actorId
      ) {
        throw new NotFoundException('User not found');
      }

      if (target.status !== UserStatus.PENDING) {
        throw new ConflictException('User is not pending');
      }

      const directlyManaged = await manager
        .getRepository(UserClosure)
        .existsBy({
          ancestorId: actorId,
          descendantId: targetId,
          depth: 1,
        });

      if (!directlyManaged) {
        throw new ConflictException('Invalid hierarchy');
      }

      const ownAssignments = await assignments.find({
        where: { userId: actorId },
        relations: { role: { permissions: true } },
      });

      const ownRoles = ownAssignments.map((x) => x.role);

      const ownPermissions = new Set(
        ownRoles.flatMap((role) =>
          role.permissions
            .filter((permission) => permission.isActive)
            .map((permission) => permission.code),
        ),
      );

      if (
        !ownPermissions.has(UserPermission.ROLE_ASSIGN) ||
        !ownPermissions.has(UserPermission.ACTIVATE)
      ) {
        throw new ForbiddenException('Insufficient permissions');
      }

      const actorLevel = Math.max(0, ...ownRoles.map((role) => role.level));

      const uniqueIds = [...new Set(roleIds)];

      if (!uniqueIds.length || uniqueIds.length > 5) {
        throw new BadRequestException('Invalid role list');
      }

      const targetRoles = await manager.getRepository(Role).find({
        where: { id: In(uniqueIds) },
        relations: { permissions: true },
      });

      if (targetRoles.length !== uniqueIds.length) {
        throw new BadRequestException('Role not found');
      }

      // Level càng cao thì Role càng cao.
      if (
        !Number.isInteger(actorLevel) ||
        targetRoles.some(
          (role) =>
            !Number.isInteger(role.level) ||
            role.level < 1 ||
            role.level >= actorLevel,
        )
      ) {
        throw new ForbiddenException('Cannot assign equal or higher roles');
      }

      if (
        targetRoles.some((role) =>
          role.permissions.some(
            (permission) =>
              permission.isActive && !ownPermissions.has(permission.code),
          ),
        )
      ) {
        throw new ForbiddenException('Cannot delegate additional permissions');
      }

      await assignments.delete({ userId: targetId });

      await assignments.insert(
        targetRoles.map((role) => ({
          userId: targetId,
          roleId: role.id,
        })),
      );

      const result = await users
        .createQueryBuilder()
        .update(User)
        .set({
          status: UserStatus.ACTIVE,
          authVersion: () => 'auth_version + 1',
        })
        .where('id = :targetId', {
          targetId: uuidV7ToBuffer(targetId),
        })
        .andWhere('status = :pending', {
          pending: UserStatus.PENDING,
        })
        .execute();

      if (result.affected !== 1) {
        throw new ConflictException('User state changed');
      }

      return {
        id: targetId,
        status: UserStatus.ACTIVE,
        roles: targetRoles.map((role) => role.code),
      };
    });
  }
}
