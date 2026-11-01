import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import CreateUserDto from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../authorization/decorators/permissions.decorator';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { UserPermission } from './permissions/user.permissions';
import { FindUsersQueryDto } from './dto/find-user-query.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';
import { UuidV7Pipe } from '../../common/pipes/uuid-v7.pipe';
import { UpdateUserProfileDto } from './dto/update-user.dto';
import { ActivateUserDto } from './dto/activate-user.dto';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    roles: string[];
  };
};
@Controller('users')
@UseGuards(ThrottlerGuard, JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions(UserPermission.FIND_ALL)
  findAll(@Query() query: FindUsersQueryDto, @Req() req: AuthenticatedRequest) {
    return this.usersService.findAll(query, req.user.id);
  }

  @Post()
  @RequirePermissions(UserPermission.CREATE)
  create(
    @Body() createUserDto: CreateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Get(':id')
  @RequirePermissions(UserPermission.FIND_ONE)
  findOne(
    @Param('id', UuidV7Pipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @RequirePermissions(UserPermission.UPDATE)
  update(
    @Param('id', UuidV7Pipe) id: string,
    @Body() updateUserDto: UpdateUserProfileDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.update(req.user.id, id, updateUserDto);
  }

  @Delete(':id')
  @RequirePermissions(UserPermission.DELETE)
  remove(@Param('id', UuidV7Pipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/activate')
  @RequirePermissions(UserPermission.ROLE_ASSIGN, UserPermission.ACTIVATE)
  activate(
    @Param('id', UuidV7Pipe) id: string,
    @Body() dto: ActivateUserDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usersService.activateChild(req.user.id, id, dto.roleIds);
  }
}
