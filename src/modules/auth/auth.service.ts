import {
  Get,
  Injectable,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../users/enums/user-status.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
} from './interface/token-payload.interface';
import { ConfigService } from '@nestjs/config';
// import { ConfigService } from 'node_modules/@nestjs/config/dist/config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  private createAccessToken(user: { id: string; username: string; roles: { code: string }[] }) {
    const payload: AccessTokenPayload = {
      sub: user.id,
      username: user.username,
      // roles: user.roles.map((role) => role.code),
      tokenType: 'access',
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
      tokenType: 'refresh',
      authVersion: user.authVersion,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
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
  async refresh(refreshToken: string) {
    let payload: RefreshTokenPayload;

    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

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

    return {
      accessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
    };
  }

  async logoutAll(userId: string) {
    await this.usersService.revokeAllRefreshTokens(userId);

    return {
      message: 'All refresh tokens have been revoked',
    };
  }
  // @Get('profile')
  // @UseGuards(JwtAuthGuard)
  // getProfile(
  //   @Req()
  //   req: Request & {
  //     user: {
  //       id: string;
  //       username: string;
  //     };
  //   },
  // ) {
  //   return req.user;
  // }
  // create(createAuthDto: CreateAuthDto) {
  //   return 'This action adds a new auth';
  // }

  // findAll() {
  //   return `This action returns all auth`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
