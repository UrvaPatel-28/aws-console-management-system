import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
  UpdateUserRequestDto,
} from './dto/request.dto';
import {
  PermissionsNeeded,
  RolesNeeded,
} from 'src/utils/decorators/permissions.decorator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { User } from 'src/utils/decorators/user.decorator';
import { UUID } from 'crypto';

@Controller('user')
@ApiBearerAuth()
@ApiTags('User')
@RolesNeeded(RoleEnum.Admin)
@PermissionsNeeded()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RolesNeeded()
  @PermissionsNeeded()
  @Post()
  async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
    const data = await this.userService.createUser(createUserRequestDto);
    return {
      data,
      message: 'User created successfully',
    };
  }

  @RolesNeeded()
  @PermissionsNeeded()
  @Get()
  async getUsers() {
    const data = await this.userService.getUsers();
    return {
      data,
      message: 'Hello ',
    };
  }

  @RolesNeeded()
  @PermissionsNeeded()
  @Patch(':user_id')
  async updateUser(
    @Body() updateUserRequestDto: UpdateUserRequestDto,
    @Param('user_id') userId: UUID,
  ) {
    return await this.userService.updateUser(updateUserRequestDto, userId);
  }

  @RolesNeeded()
  @PermissionsNeeded()
  @Get(':user_id')
  async getUserDetails(@Param('user_id') userId: UUID) {
    return await this.userService.getUserDetails(userId);
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
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.CreateAwsCredentials)
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
  async listAwsProgrammaticCredentials() {
    return await this.userService.listAwsProgrammaticCredentials();
  }
}
