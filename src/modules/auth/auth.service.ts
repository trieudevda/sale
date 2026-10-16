import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../users/enums/user-status.enum';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
} from './interface/token-payload.interface';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { RevokedRefreshToken } from './entities/revoked-refresh-token.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto';
type VerifiedRefreshTokenPayload = RefreshTokenPayload & {
  exp: number;
  iat: number;
};
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RevokedRefreshToken)
    private readonly revokeRefreshToken: Repository<RevokedRefreshToken>,
  ) {}
  private createAccessToken(user: {
    id: string;
    username: string;
    roles: { code: string }[];
    authVersion: number;
  }) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      // roles: user.roles.map((role) => role.code),
      tokenType: TokenType.ACCESS,
      authVersion: user.authVersion,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_ACCESS_EXPIRES_IN'),
    });
  }

  private createRefreshToken(user: {
    id: string;
    username: string;
    authVersion: number;
  }) {
    const payload: RefreshTokenPayload = {
      sub: user.id,
      username: user.username,
      tokenType: TokenType.REFRESH,
      authVersion: user.authVersion,
      jti: randomUUID(),
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      algorithm: 'HS256',
    });
  }
  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    const isPasswordValid = await this.usersService.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
    };
  }
  async refresh({ refreshToken }: RefreshTokenDto) {
    // let payload: RefreshTokenPayload;
    const payload = await this.verifyRefreshToken({ refreshToken });

    const user = await this.usersService.findAuthStateById(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    // Token đã bị thu hồi khi version không còn khớp.
    if (payload.authVersion !== user.authVersion) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }
    const [accessToken, newRefreshToken] = await Promise.all([
      this.createAccessToken(user),
      this.createRefreshToken(user),
    ]);
    const consumed = await this.revokeToken(payload.jti, payload.exp);

    if (!consumed) {
      throw new UnauthorizedException(
        'Refresh token has been revoked or reused',
      );
    }
    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    };
  }

  async logout({ refreshToken }: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken({ refreshToken });
    await this.revokeToken(payload.jti, payload.exp);
    return { message: 'Logged out.' };
  }

  async logoutAll(userId: string) {
    await this.usersService.revokeAllRefreshTokens(userId);

    return {
      message: 'All refresh tokens have been revoked',
    };
  }
  private async verifyRefreshToken({
    refreshToken,
  }: RefreshTokenDto): Promise<VerifiedRefreshTokenPayload> {
    try {
      const payload =
        await this.jwtService.verifyAsync<VerifiedRefreshTokenPayload>(
          refreshToken,
          {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            algorithms: ['HS256'],
          },
        );

      if (
        payload.tokenType !== TokenType.REFRESH ||
        typeof payload.sub !== 'string' ||
        typeof payload.jti !== 'string' ||
        typeof payload.authVersion !== 'number' ||
        typeof payload.exp !== 'number'
      ) {
        throw new Error('Invalid payload');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  private async revokeToken(jti: string, exp: number): Promise<boolean> {
    try {
      await this.revokeRefreshToken.insert({
        jti,
        expiresAt: new Date(exp * 1000),
      });

      return true;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code === 'ER_DUP_ENTRY'
      ) {
        return false;
      }

      throw error;
    }
  }
}
