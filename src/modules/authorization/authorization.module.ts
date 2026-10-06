import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/roles.entity';
import { Permission } from './entities/permissions.entity';
import { UserRole } from './entities/user-roles.entity';
import { RolePermission } from './entities/role-permissions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role, Permission, UserRole, RolePermission]),
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
})
export class AuthorizationModule {}
