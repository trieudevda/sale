import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  AccessTokenPayload,
  TokenType,
} from './interface/token-payload.interface';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../users/enums/user-status.enum';
// import { UserStatus } from '../authorization/enums/user-status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: AccessTokenPayload) {
    if (
      payload.tokenType !== TokenType.ACCESS ||
      typeof payload.sub !== 'string' ||
      !Number.isSafeInteger(payload.authVersion) ||
      payload.authVersion < 0
    ) {
      throw new UnauthorizedException('Invalid access token');
    }
    const user = await this.usersService.findPrincipalById(payload.sub);
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      user.authVersion !== payload.authVersion
    ) {
      throw new UnauthorizedException('Account is not active');
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
      username: user.username,
      roles: roles,
      permissions: permissions,
      // jti: payload.
    };
  }
}
