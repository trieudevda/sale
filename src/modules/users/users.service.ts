import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DataSource, Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    ) {}
  async createOrder() {
    return this.dataSource.transaction(async (manager) => {
      // create order
      // create order items
      // decrease stock
    });
  }
  async create(createUserDto: CreateUserDto){
    const pass = await this.hashPassword(createUserDto.passwordHash);
    const user = this.userRepository.create({
      email: createUserDto.email,
      phone: createUserDto.phone,
      username: createUserDto.username,
      passwordHash: pass,
    });
    return this.userRepository.save(user);
    return 'This action adds a new user';
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
