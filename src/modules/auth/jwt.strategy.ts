import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenPayload } from './interface/token-payload.interface';
import { UsersService } from '../users/users.service';
import { UserStatus } from '../authorization/enums/user-status.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(configService: ConfigService,private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
    }); 
  }

  async validate(payload: AccessTokenPayload) {
    if(payload.tokenType !== 'access') {
      throw new Error('Invalid token type');
    }
    const user = await this.usersService.findPrincipalById(payload.sub);
    if (!user || user.status !== UserStatus.ACTIVE) {
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
    };
  }
}
