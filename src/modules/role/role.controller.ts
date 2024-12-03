import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import {
  PermissionsNeeded,
  RolesNeeded,
} from 'src/utils/decorators/permissions.decorator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';
import { AddRoleRequestDto } from './dto/request.dto';

@Controller('role')
@ApiBearerAuth() // Adds Bearer Token Authentication for Swagger documentation.
@ApiTags('Role') // Groups endpoints under the "Role" category in Swagger.
@RolesNeeded(RoleEnum.Admin, RoleEnum.AccessManager) // Sets common roles required for all APIs of this this controller. (In this Admin and AccessManager)
@PermissionsNeeded(PermissionEnum.ManageRoleAndPermissions) /// Sets common permissions required for all APIs of this this controller.
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  /**
   * Adds a new role.
   * @param addRoleRequestDto - DTO containing details of the role to add.
   * @returns The created role or a success message.
   */
  @Post()
  @RolesNeeded()
  @PermissionsNeeded()
  async addRole(@Body() addRoleRequestDto: AddRoleRequestDto) {
    const data = await this.roleService.addRole(addRoleRequestDto);
    return {
      data,
    };
  }

  /**
   * Retrieves a list of all roles with their permissions.
   * @returns An array of roles.
   */
  @Get()
  @RolesNeeded()
  @PermissionsNeeded()
  async getRoles() {
    const data = await this.roleService.getRoles();
    return {
      data,
    };
  }

  /**
   * Retrieves a list of all permissions available in the system.
   * @returns An array of permissions.
   */
  @Get('list-permissions')
  @RolesNeeded()
  @PermissionsNeeded()
  async getPermissions() {
    const data = await this.roleService.getPermissions();
    return {
      data,
    };
  }
}
