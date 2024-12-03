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
@ApiBearerAuth() // Adds authentication information in the Swagger documentation.
@ApiTags('User') // Categorizes the endpoints under the "User" tag in Swagger.
@RolesNeeded(RoleEnum.Admin) // Sets common roles required for all APIs of this this controller. (In this Admin)
@PermissionsNeeded() // Sets common permissions required for all APIs of this this controller.
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user.
   * Restricted to the Admin role.
   * @param createUserRequestDto - Data transfer object for creating a user.
   */
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

  /**
   * Get the list of all users.
   * Restricted to the Admin role.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get()
  async getUsers() {
    const data = await this.userService.getUsers();
    return {
      data,
    };
  }

  /**
   * Update an existing user.
   * Restricted to the Admin role.
   * @param updateUserRequestDto - Data transfer object for updating a user.
   * @param userId - UUID of the user to update.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Patch(':user_id')
  async updateUser(
    @Body() updateUserRequestDto: UpdateUserRequestDto,
    @Param('user_id') userId: UUID,
  ) {
    const data = await this.userService.updateUser(
      updateUserRequestDto,
      userId,
    );
    return {
      data,
      message: 'User updated successfully',
    };
  }

  /**
   * Get details of a specific user.
   * Restricted to the Admin role.
   * @param userId - UUID of the user.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('/:user_id')
  async getUserDetails(@Param('user_id') userId: UUID) {
    const data = await this.userService.getUserDetails(userId);
    return {
      data,
    };
  }

  /**
   * Create AWS Console credentials for a user.
   * Restricted to the TeamLeader and Admin role and specific permissions.
   * @param addAwsConsoleCredentialsRequestDto - DTO with AWS Console credential details.
   * @param user - User context passed from the decorator.
   */
  @Post('aws/create-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.CreateAwsCredentials)
  async createAwsConsoleCredentials(
    @Body()
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    @User() user: UserBasicInfo, // Custom decorator to inject authenticated user information.
  ) {
    const data = await this.userService.createAwsConsoleCredentials(
      addAwsConsoleCredentialsRequestDto,
      user,
    );
    return {
      data,
      message: `AWS console credentials created successfully`,
    };
  }
  /**
   * Update AWS Console credentials for a user.
   * Restricted to the TeamLeader and Admin role and specific permissions.
   * @param updateAwsConsoleCredentialsRequestDto - Data transfer object for updating AWS Console credentials.
   * @param user - User context passed from the decorator.
   */
  @Patch('/aws/update-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.UpdateAwsCredentials)
  async updateAwsConsoleCredentials(
    @Body()
    updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    const data = await this.userService.updateAwsConsoleCredentials(
      updateAwsConsoleCredentialsRequestDto,
      user,
    );

    return {
      data,
      message: 'AWS console credentials updated successfully',
    };
  }

  /**
   * Delete AWS Console credentials for a user.
   * Restricted to the TeamLeader role and specific permissions.
   * @param deleteAwsConsoleCredentialsRequestDto - Data transfer object for deleting AWS Console credentials.
   */
  @Delete('/aws/delete-console-user')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.DeleteAwsCredentials)
  async deleteAwsConsoleCredentials(
    @Body()
    deleteAwsConsoleCredentialsRequestDto: DeleteAwsConsoleCredentialsRequestDto,
  ) {
    const data = await this.userService.deleteAwsConsoleCredentials(
      deleteAwsConsoleCredentialsRequestDto,
    );
    return {
      data,
      message: 'AWS console credentials deleted successfully',
    };
  }

  /**
   * Create programmatic credentials for AWS services.
   * Restricted to the TeamLeader and Admin role and specific permissions.
   * @param createProgrammaticCredentialsRequestDto - Data transfer object for creating AWS programmatic credentials.
   * @param user - User context passed from the decorator.
   */
  @Post('/aws/create-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.CreateAwsCredentials)
  async createProgrammaticCredentials(
    @Body()
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    const data = await this.userService.createProgrammaticCredentials(
      createProgrammaticCredentialsRequestDto,
      user,
    );
    return {
      data,
      message: 'AWS programmatic credentials created successfully',
    };
  }

  /**
   * Update programmatic credentials for AWS services.
   * Restricted to the TeamLeader and Admin role and specific permissions.
   * @param updateProgrammaticCredentialsRequestDto - Data transfer object for updating AWS programmatic credentials status.
   * @param user - User context passed from the decorator.
   * @returns
   */
  @Patch('/aws/update-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.UpdateAwsCredentials)
  async updateProgrammaticCredentials(
    @Body()
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    @User() user: UserBasicInfo,
  ) {
    const data = await this.userService.updateAwsProgrammaticCredentials(
      updateProgrammaticCredentialsRequestDto,
      user,
    );
    return {
      data,
      message: 'AWS programmatic credentials updated successfully',
    };
  }

  /**
   * Delete programmatic credentials for AWS services.
   * Restricted to the TeamLeader and Admin role and specific permissions.
   * @param deleteProgrammaticCredentialsRequestDto - Data transfer object for deleting AWS programmatic credentials status.
   * @returns
   */
  @Delete('/aws/delete-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader)
  @PermissionsNeeded(PermissionEnum.DeleteAwsCredentials)
  async deleteProgrammaticCredentials(
    @Body()
    deleteProgrammaticCredentialsRequestDto: DeleteProgrammaticCredentialsRequestDto,
  ) {
    const data = await this.userService.deleteProgrammaticCredentials(
      deleteProgrammaticCredentialsRequestDto,
    );
    return {
      data,
      message: 'AWS programmatic credentials deleted successfully',
    };
  }

  /**
   * List all AWS Console credentials.
   * Accessible by TeamLeader, TeamMember and Admin roles with appropriate permissions.
   */
  @Get('/aws/list-console-credentials')
  @RolesNeeded(RoleEnum.TeamLeader, RoleEnum.TeamMember)
  @PermissionsNeeded(PermissionEnum.ViewAwsCredentials)
  async listAwsConsoleCredentials() {
    const data = await this.userService.listAwsConsoleCredentials();
    return {
      data,
    };
  }

  /**
   * List all AWS programmatic credentials.
   * Accessible by TeamLeader, TeamMember and Admin roles with appropriate permissions.
   */
  @Get('aws/list-programmatic-credentials')
  @RolesNeeded(RoleEnum.TeamLeader, RoleEnum.TeamMember)
  @PermissionsNeeded(PermissionEnum.ViewAwsCredentials)
  async listAwsProgrammaticCredentials() {
    const data = await this.userService.listAwsProgrammaticCredentials();
    return { data };
  }
}
