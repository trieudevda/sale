import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<string[]>(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPermissions: string[] =
      request.user?.permissions ?? [];
    console.log('User Permissions:', userPermissions);
    console.log('requiredPermissions Permissions:', requiredPermissions);
    // User phải có tất cả permission mà endpoint yêu cầu.
    const isAllowed = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!isAllowed) {
      throw new ForbiddenException({
        code: 'FORBIDDEN',
        message: 'You do not have the required permission',
        requiredPermissions,
      });
    }

    return true;
  }
}