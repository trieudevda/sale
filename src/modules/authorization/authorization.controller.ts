import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthorizationService } from './authorization.service';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@UseGuards(ThrottlerGuard, JwtAuthGuard, PermissionsGuard)
@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  // @Post()
  // create(@Body() createAuthorizationDto: CreateAuthorizationDto) {
  //   return this.authorizationService.create(createAuthorizationDto);
  // }

  // @Get()
  // findAll() {
  //   return this.authorizationService.findAll();
  // }
  //
  // @Get('permissions')
  // findAllPermissions() {
  //   return this.authorizationService.findAllPermissions();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authorizationService.findOne(id);
  // }
  //
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateAuthorizationDto: UpdateAuthorizationDto,
  // ) {
  //   return this.authorizationService.update(id, updateAuthorizationDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authorizationService.remove(id);
  // }
}
