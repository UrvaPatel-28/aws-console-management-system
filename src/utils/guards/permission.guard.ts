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

/**
 * Guard that handles role-based and permission-based access control for routes.
 * It checks if the user has the required roles and permissions to access a specific route.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Main logic for checking user access based on roles and permissions.
   *
   * @param context - The execution context, used to access the request and metadata.
   * @returns true if the user is authorized, throws an exception otherwise.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Retrieves the metadata `ALLOW_UNAUTHORIZED` set on the handler method, which bypasses the guard.
    const allowUnauthorized = this.reflector.get<boolean[]>(
      ALLOW_UNAUTHORIZED,
      context.getHandler(),
    );
    if (allowUnauthorized) return true; // If the route allows unauthorized access, proceed.

    // Retrieves the request object and extracts the user information from the request.
    const request: Request & { user: UserBasicInfo } = context
      .switchToHttp()
      .getRequest();

    // Retrieve roles and permissions metadata set on the route handler and class.
    const rolesFromHandler = this.reflector.get<RoleEnum[]>(
      ROLES,
      context.getHandler(),
    );
    const rolesFromClass = this.reflector.get<RoleEnum[]>(
      ROLES,
      context.getClass(),
    );
    console.log(rolesFromClass, rolesFromHandler);

    const permissionsFromHandler = this.reflector.get<PermissionEnum[]>(
      PERMISSIONS,
      context.getHandler(),
    );
    const permissionsFromClass = this.reflector.get<PermissionEnum[]>(
      PERMISSIONS,
      context.getClass(),
    );

    // If roles or permissions metadata is missing, throw a BadRequestException.
    if (
      !rolesFromClass ||
      !rolesFromHandler ||
      !permissionsFromClass ||
      !permissionsFromHandler
    ) {
      throw new BadRequestException('Feature Not Accessible');
    }

    // Merge the roles and permissions metadata from the class and handler.
    const roles = [...rolesFromClass, ...rolesFromHandler];
    const permission = [...permissionsFromClass, ...permissionsFromHandler];

    // If no roles or permissions are required, grant access.
    if (!roles.length && !permission.length) {
      return true;
    }

    // Convert roles and permissions to Sets for efficient checking.
    const rolesSet = new Set(roles);
    const permissionsSet = new Set(permission);

    // Check if the user's role matches any of the required roles.
    if (!rolesSet.has(request.user.role.name))
      throw new ForbiddenException('User does not have required role');

    // Map the user's permissions into a Set for quick lookup.
    const userPermissions = new Set(
      request.user.role.permissions.map((permission) => permission.name),
    );

    // Check if the user has all required permissions.
    const hasAllPermissions = [...permissionsSet].every((permission) =>
      userPermissions.has(permission),
    );
    if (!hasAllPermissions)
      throw new ForbiddenException('User does not have required permissions');

    // If the user has the required role and permissions, grant access.
    return true;
  }
}
