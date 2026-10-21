import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../users/enums/user-status.enum';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenType,
} from './interface/token-payload.interface';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthSession } from './entities/auth-session.entity';
import { AuthSettings } from './auth-settings';
import { assertRefreshClaims } from './token-claims';
import { uuidV7ToBuffer } from '../../database/uuid-v7';
type TokenSubject = {
  id: string;
  username: string;
  authVersion: number;
};
@Injectable()
export class AuthService implements OnModuleInit {
  private dummyHash!: string;
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly settings: AuthSettings,
    @InjectRepository(AuthSession)
    private readonly authSessionRepository: Repository<AuthSession>,
  ) {}
  async onModuleInit(): Promise<void> {
    this.dummyHash = await this.usersService.hashPassword(randomUUID());
  }
  private async issueTokens(
    user: TokenSubject,
    sid: string,
    jti: string,
    sessionExp: number,
  ) {
    const now = Math.floor(Date.now() / 1000);

    if (sessionExp <= now) {
      throw new UnauthorizedException('Session expired');
    }

    const common = {
      sub: user.id,
      sid,
      username: user.username,
      authVersion: user.authVersion,
      iat: now,
    };

    const access: AccessTokenPayload = {
      ...common,
      tokenType: TokenType.ACCESS,
      exp: Math.min(now + this.settings.accessTtl, sessionExp),
    };

    const refresh: RefreshTokenPayload = {
      ...common,
      tokenType: TokenType.REFRESH,
      jti,
      exp: sessionExp,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(access, {
        secret: this.settings.accessSecret,
        algorithm: 'HS256',
        issuer: this.settings.issuer,
        audience: this.settings.accessAudience,
      }),
      this.jwtService.signAsync(refresh, {
        secret: this.settings.refreshSecret,
        algorithm: 'HS256',
        issuer: this.settings.issuer,
        audience: this.settings.refreshAudience,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer' as const,
    };
  }
  async login(dto: LoginDto) {
    const user = await this.usersService.findByUsername(dto.username);
    const valid = await this.usersService.verifyPassword(
      user?.passwordHash ?? this.dummyHash,
      dto.password,
    );
    if (!user || !valid || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Username or password is incorrect');
    }
    const sid = randomUUID();
    const jti = randomUUID();
    const sessionExp = Math.floor(Date.now() / 1000) + this.settings.refreshTtl;
    const tokens = await this.issueTokens(user, sid, jti, sessionExp);

    await this.authSessionRepository.insert({
      id: sid,
      userId: user.id,
      currentRefreshJti: jti,
      expiresAt: new Date(sessionExp * 1000),
      revokedAt: null,
    });

    return tokens;
  }
  async refresh(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);

    const user = await this.usersService.findAuthStateById(payload.sub);

    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.authVersion !== payload.authVersion
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    const nextJti = randomUUID();
    const tokens = await this.issueTokens(
      user,
      payload.sid,
      nextJti,
      payload.exp,
    );
    const result = await this.authSessionRepository
      .createQueryBuilder()
      .update(AuthSession)
      .set({ currentRefreshJti: nextJti })
      .where('id = :sid', { sid: payload.sid })
      .andWhere('user_id = :uid', { uid: uuidV7ToBuffer(payload.sub) })
      .andWhere('current_refresh_jti = :jti', {
        jti: payload.jti,
      })
      .andWhere('revoked_at IS NULL')
      .andWhere('expires_at > :now', { now: new Date() })
      .execute();
    if (result.affected !== 1) {
      await this.revokeSession(payload);

      this.logger.warn({
        event: 'refresh_rejected',
        userId: payload.sub,
        sid: payload.sid,
      });

      throw new UnauthorizedException(
        'Session expired, revoked, or token reused',
      );
    }

    return tokens;
  }
  private async revokeSession(
    payload: Pick<RefreshTokenPayload, 'sub' | 'sid'>,
  ): Promise<void> {
    await this.authSessionRepository
      .createQueryBuilder()
      .update(AuthSession)
      .set({ revokedAt: new Date() })
      .where('id = :sid', { sid: payload.sid })
      .andWhere('user_id = :uid', { uid: uuidV7ToBuffer(payload.sub) })
      .andWhere('revoked_at IS NULL')
      .execute();
  }
  async logout(dto: RefreshTokenDto) {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    await this.revokeSession(payload);
    return { message: 'Logged out.' };
  }

  async logoutAll(userId: string) {
    await this.usersService.revokeAllRefreshTokens(userId);

    return {
      message: 'All refresh tokens have been revoked',
    };
  }
  private async verifyRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload> {
    let payload: unknown;
    try {
      payload = await this.jwtService.verifyAsync<object>(token, {
        secret: this.settings.refreshSecret,
        algorithms: ['HS256'],
        issuer: this.settings.issuer,
        audience: this.settings.refreshAudience,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    assertRefreshClaims(payload);

    return payload;
  }
}
