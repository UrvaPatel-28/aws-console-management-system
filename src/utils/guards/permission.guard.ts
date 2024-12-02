import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ALLOW_UNAUTHORIZED } from '../decorators/allow-unauthorized.decorator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';
import { PERMISSIONS, ROLES } from '../decorators/permissions.decorator';
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

    const request: Request & {
      user: UserBasicInfo;
    } = context.switchToHttp().getRequest();
    // if (request.user.role.name === RoleEnum.Admin) return true;

    const rolesFromHandler = this.reflector.get<RoleEnum[]>(
      ROLES,
      context.getHandler(),
    );
    const rolesFromClass = this.reflector.get<RoleEnum[]>(
      ROLES,
      context.getClass(),
    );

    const permissionsFromHandler = this.reflector.get<PermissionEnum[]>(
      PERMISSIONS,
      context.getHandler(),
    );
    const permissionsFromClass = this.reflector.get<PermissionEnum[]>(
      PERMISSIONS,
      context.getClass(),
    );

    if (
      !rolesFromClass ||
      !rolesFromHandler ||
      !permissionsFromClass ||
      !permissionsFromHandler
    ) {
      throw new BadRequestException('Feature Not Accessible');
    }

    const roles = [...rolesFromClass, ...rolesFromHandler];
    const permission = [...permissionsFromClass, ...permissionsFromHandler];

    if (!roles.length && !permission.length) {
      return true;
    }

    const rolesSet = new Set(roles);
    const permissionsSet = new Set(permission);

    if (!rolesSet.has(request.user.role.name))
      throw new ForbiddenException('User does not have required role');

    const userPermissions = new Set(
      request.user.role.permissions.map((permission) => permission.name),
    );

    const hasAllPermissions = [...permissionsSet].every((permission) =>
      userPermissions.has(permission),
    );
    if (!hasAllPermissions)
      throw new ForbiddenException('User does not have required permissions');
    return true;
  }
}
