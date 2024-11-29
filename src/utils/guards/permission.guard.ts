import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_UNAUTHORIZED } from '../decorators/allow-unauthorized.decorator';
import { RoleEnum } from 'src/constants/enum';
import { ROLES } from '../decorators/permissions.decorator';
import { UserBasicInfo } from '../interface/auth.type';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const allowUnauthorized = this.reflector.get<boolean[]>(
      ALLOW_UNAUTHORIZED,
      context.getHandler(),
    );

    if (allowUnauthorized) return true;

    const rolesFromHandler = this.reflector.get<RoleEnum[]>(
      ROLES,
      context.getHandler(),
    );

    const rolesSet = new Set(rolesFromHandler);
    // const permissionsSet = new Set(permissionsFromHandler);

    const request: Request & {
      user: UserBasicInfo;
    } = context.switchToHttp().getRequest();

    if (request.user.role.name === RoleEnum.Admin) return true;

    if (!rolesSet.has(request.user.role.name))
      throw new ForbiddenException('Access denied');

    return true;
  }
}
