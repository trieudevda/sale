import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

interface AuthenticatedRequest {
  user?: {
    permissions: string[];
  };
}
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new ForbiddenException('Access denied');
    }
    const userPermissions: string[] = request.user?.permissions ?? [];
    // User phải có tất cả permission mà endpoint yêu cầu.
    const isAllowed = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
