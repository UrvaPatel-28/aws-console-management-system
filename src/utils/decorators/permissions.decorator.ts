import { SetMetadata } from '@nestjs/common';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';

export const PERMISSIONS = 'PERMISSIONS';
export const ROLES = 'ROLES';
export const PermissionsNeeded = (...permissions: PermissionEnum[]) =>
  SetMetadata(PERMISSIONS, permissions);
export const RolesNeeded = (...roles: RoleEnum[]) => SetMetadata(ROLES, roles);
