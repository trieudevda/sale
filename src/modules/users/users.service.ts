import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import CreateUserDto from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Brackets, DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ErrorCode } from '../../common/exceptions/error-code';
import { Role } from '../authorization/entities/roles.entity';
import { AuthorizationService } from '../authorization/authorization.service';
import { RoleService } from '../authorization/role.sevice';
import { UserStatus } from './enums/user-status.enum';
import { FindUsersQueryDto } from './dto/find-user-query.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly roleService: RoleService,
  ) {}
  // async createOrder() {
  //   return this.dataSource.transaction(async (manager) => {
  //     // create order
  //     // create order items
  //     // decrease stock
  //   });
  // }
  async create(createUserDto: CreateUserDto) {
    const { roleIds, password, ...userData } = createUserDto;
    const whereUser: FindOptionsWhere<User>[] = [];
    if (userData.phone) {
      whereUser.push({ phone: userData.phone });
    }
    if (userData.email) {
      whereUser.push({ email: userData.email });
    }
    if (userData.username) {
      whereUser.push({ username: userData.username });
    }
    const exists = whereUser.length
      ? await this.userRepository.find({
          where: whereUser,
          select: {
            phone: true,
            email: true,
            username: true,
          },
        })
      : [];
    const conflicts: string[] = [];
    for (const user of exists) {
      if (userData.phone && userData.phone === user.phone) {
        conflicts.push('phone');
      }
      if (userData.email && userData.email === user.email) {
        conflicts.push('email');
      }
      if (userData.username && userData.username === user.username) {
        conflicts.push('username');
      }
    }
    if (conflicts.length > 0) {
      throw new ConflictException({
        code: ErrorCode.USER_ALREADY_EXISTS,
        message: 'User information already exists',
        fields: [...new Set(conflicts)],
      });
    }
    const roles = roleIds?.length
      ? await this.roleService.findAllRole({ ids: roleIds })
      : undefined;
    const passwordHash = await this.hashPassword(password);
    const user = this.userRepository.create({
      ...userData,
      passwordHash: passwordHash,
      roles,
    });
    return this.userRepository.save(user);
  }
  async findAll(query: FindUsersQueryDto) {
    const { q, page, limit, sort, roleId, status = UserStatus.ACTIVE } = query;

    const queryBuilder = this.userRepository
      .createQueryBuilder('users')
      .leftJoinAndSelect('users.roles', 'roles')
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
        'roles.id',
        'roles.code',
        'roles.name',
      ])
      .where('users.status = :status', { status });

    if (q) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('users.username LIKE :keyword')
            .orWhere('users.email LIKE :keyword')
            .orWhere('users.phone LIKE :keyword')
            .orWhere('users.firstName LIKE :keyword')
            .orWhere('users.lastName LIKE :keyword')
            .orWhere(
              `CONCAT_WS(
              ' ',
              users.firstName,
              users.lastName
            ) LIKE :keyword`,
            );
        }),
      );

      queryBuilder.setParameter('keyword', `%${q}%`);
    }

    if (roleId) {
      // Join riêng để lọc nhưng vẫn trả về đầy đủ roles của user.
      queryBuilder.innerJoin(
        'users.roles',
        'filterRole',
        'filterRole.id = :roleId',
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

    return {
      items: users,
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
      relations: {
        roles: true,
      },
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
        roles: {
          permissions: true,
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

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
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
}
