import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { AuthorizationController } from './authorization.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/roles.entity';
import { Permission } from './entities/permissions.entity';
import { RoleService } from './role.sevice';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, RoleService],
  exports: [AuthorizationService, RoleService],
})
export class AuthorizationModule {}
