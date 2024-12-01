import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateProgrammaticCredentialsRequestDto,
  CreateUserRequestDto,
  DeleteAwsConsoleCredentialsRequestDto,
  DeleteProgrammaticCredentialsRequestDto,
  UpdateAwsConsoleCredentialsRequestDto,
  UpdateProgrammaticCredentialsRequestDto,
} from './dto/request.dto';
import {
  PermissionsNeeded,
  RolesNeeded,
} from 'src/utils/decorators/permissions.decorator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { User } from 'src/utils/decorators/user.decorator';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
    return await this.userService.createUser(createUserRequestDto);
  }

  @Post('create-aws-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.CreateAwsCredentials)
  async createAwsConsoleCredentials(
    @Body()
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.createAwsConsoleCredentials(
      addAwsConsoleCredentialsRequestDto,
      user,
    );
  }

  @Patch('update-aws-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.UpdateAwsCredentials)
  async updateAwsConsoleCredentials(
    @Body()
    updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.updateAwsConsoleCredentials(
      updateAwsConsoleCredentialsRequestDto,
      user,
    );
  }

  @Delete('delete-aws-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.DeleteAwsCredentials)
  async deleteAwsConsoleCredentials(
    @Body()
    deleteAwsConsoleCredentialsRequestDto: DeleteAwsConsoleCredentialsRequestDto,
  ) {
    return await this.userService.deleteAwsConsoleCredentials(
      deleteAwsConsoleCredentialsRequestDto,
    );
  }

  @Post('create-aws-programmatic-credentials')
  @PermissionsNeeded(PermissionEnum.CreateAwsCredentials)
  @RolesNeeded(RoleEnum.TeamLeader)
  async createProgrammaticCredentials(
    @Body()
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.createProgrammaticCredentials(
      createProgrammaticCredentialsRequestDto,
      user,
    );
  }

  @Patch('update-aws-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.UpdateAwsCredentials)
  async updateProgrammaticCredentials(
    @Body()
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    return await this.userService.updateAwsProgrammaticCredentials(
      updateProgrammaticCredentialsRequestDto,
      user,
    );
  }

  @Delete('delete-aws-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.DeleteAwsCredentials)
  async deleteProgrammaticCredentials(
    @Body()
    deleteProgrammaticCredentialsRequestDto: DeleteProgrammaticCredentialsRequestDto,
  ) {
    return await this.userService.deleteProgrammaticCredentials(
      deleteProgrammaticCredentialsRequestDto,
    );
  }

  @Get('list-aws-console-credentials')
  @RolesNeeded(RoleEnum.TeamLeader, RoleEnum.TeamMember)
  @PermissionsNeeded(PermissionEnum.ViewAwsCredentials)
  async listAwsConsoleCredentials() {
    return await this.userService.listAwsConsoleCredentials();
  }

  @Get('list-aws-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader, RoleEnum.TeamMember)
  @PermissionsNeeded(PermissionEnum.ViewAwsCredentials)
  async listAwsProgrammatcCredentials() {
    return await this.userService.listAwsProgrammatcCredentials();
  }
}
