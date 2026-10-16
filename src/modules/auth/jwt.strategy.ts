import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/enums/user-status.enum';
import { AuthSettings } from './auth-settings';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { AuthSession } from './entities/auth-session.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { assertAccessClaims } from './token-claims';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    settings: AuthSettings,
    private readonly usersService: UsersService,
    @InjectRepository(AuthSession)
    private readonly session: Repository<AuthSession>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,

      secretOrKey: settings.accessSecret,
      algorithms: ['HS256'],
      issuer: settings.issuer,
      audience: settings.accessAudience,
    });
  }

  async validate(payload: unknown) {
    assertAccessClaims(payload);
    const user = await this.usersService.findPrincipalById(payload.sub);
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.authVersion !== payload.authVersion
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }
    const active = await this.session.existsBy({
      id: payload.sid,
      userId: payload.sub,
      revokedAt: IsNull(),
      expiresAt: MoreThan(new Date()),
    });

    if (!active) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const roles = user.roles.map((role) => role.code);

    const permissions = [
      ...new Set(
        user.roles.flatMap((role) =>
          role.permissions
            .filter((permission) => permission.isActive)
            .map((permission) => permission.code),
        ),
      ),
    ];
    return {
      id: user.id,
      sid: payload.sid,
      username: user.username,
      roles,
      permissions,
    };
  }
}
