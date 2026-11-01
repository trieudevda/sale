import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user-role.entity';
import { UserClosure } from './entities/user-closure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserRole, UserClosure])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
// throw new NotFoundException({
//   code: ErrorCode.PRODUCT_NOT_FOUND,
//   message: 'Không tìm thấy sản phẩm',
// });
