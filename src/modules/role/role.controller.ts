import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { RolesNeeded } from 'src/utils/decorators/permissions.decorator';
import { RoleEnum } from 'src/constants/enum';
import { AddRoleRequestDto } from './dto/request.dto';

@Controller('role')
@ApiBearerAuth()
@ApiTags('Role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @RolesNeeded(RoleEnum.Admin)
  async addRole(@Body() addRoleRequestDto: AddRoleRequestDto) {
    return await this.roleService.addRole(addRoleRequestDto);
  }
}
