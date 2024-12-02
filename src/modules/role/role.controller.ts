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
@ApiBearerAuth()
@ApiTags('Role')
@RolesNeeded(RoleEnum.Admin, RoleEnum.AccessManager)
@PermissionsNeeded(PermissionEnum.ManageRoleAndPermissions)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RolesNeeded()
  @PermissionsNeeded()
  async addRole(@Body() addRoleRequestDto: AddRoleRequestDto) {
    return await this.roleService.addRole(addRoleRequestDto);
  }

  @Get()
  @RolesNeeded()
  @PermissionsNeeded()
  async getRoles() {
    return await this.roleService.getRoles();
  }

  @Get('list-permissions')
  @RolesNeeded()
  @PermissionsNeeded()
  async getPermissions() {
    return await this.roleService.getPermissions();
  }
}
