import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import CreateUserDto from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, FindOptionsWhere, In, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ErrorCode } from '../../common/exceptions/error-code';
import { Role } from '../authorization/entities/roles.entity';
import { AuthorizationService } from '../authorization/authorization.service';
import { RoleService } from '../authorization/role.sevice';

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

  findAll() {
    return `This action returns all users`;
  }
  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username,
      },
    });
  }

  findById(id: string) {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
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
