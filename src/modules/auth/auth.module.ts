import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { AuthSettings } from './auth-settings';
import { SessionCleanupService } from './session-cleanup.service';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([AuthSession]),
    JwtModule.register({}),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthSettings, SessionCleanupService],
})
export class AuthModule {}
