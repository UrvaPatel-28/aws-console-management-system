import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AwsStsService } from './aws.sts.service';
import { AwsIamService } from './aws.iam.service';
import {
  AssumeRoleRequestDto,
  CreateLoginProfileRequestDto,
  CreatePolicyRequestDto,
  CreateRoleRequestDto,
  CreateAwsUserRequestDto,
  GeneratePolicyRequestDto,
  AttachPolicyToUserRequestDto,
  AttachPolicyToRoleRequestDto,
  AwsUsernameRequestDto,
  DeleteAccessKeysRequestDto,
  GetTemporaryConsoleAccess,
} from './dto/request.dto';
import {
  PermissionsNeeded,
  RolesNeeded,
} from 'src/utils/decorators/permissions.decorator';
import { RoleEnum } from 'src/constants/enum';

@Controller('aws')
@ApiBearerAuth() // Adds a bearer token authentication in Swagger documentation.
@ApiTags('Aws') // Groups this controller under the "AWS" category in Swagger.
@RolesNeeded(RoleEnum.Admin, RoleEnum.TeamLeader) // Sets common roles required for all APIs of this this controller. (In this Admin and TeamLeader)
@PermissionsNeeded() // Sets common permissions required for all APIs of this this controller.
export class AwsController {
  constructor(
    private readonly awsStsService: AwsStsService,
    private readonly awsIamService: AwsIamService,
  ) {}

  /**
   * Creates an IAM policy.
   * @param createPolicyRequestDto - DTO containing policy details.
   * @returns The created policy.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/create-policy')
  async createPolicy(@Body() createPolicyRequestDto: CreatePolicyRequestDto) {
    const data = await this.awsIamService.createPolicy(createPolicyRequestDto);
    return { data, message: 'AWS Policy created successfully' };
  }

  /**
   * Generates an IAM policy document.
   * @param generatePolicyRequestDto - DTO with policy details.
   * @returns The generated policy document.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/generate-policy-document')
  generatePolicyDocument(
    @Body() generatePolicyRequestDto: GeneratePolicyRequestDto,
  ) {
    const data = this.awsIamService.generatePolicyDocument(
      generatePolicyRequestDto,
    );
    return {
      data,
      message: 'AWS Policy document created successfully',
    };
  }

  /**
   * Creates an IAM role.
   * @param createRoleRequestDto - DTO with role details.
   * @returns The created role.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/create-role')
  async createRole(@Body() createRoleRequestDto: CreateRoleRequestDto) {
    const data = await this.awsIamService.createRole(createRoleRequestDto);
    return { data, message: 'AWS Role created successfully' };
  }

  /**
   * Attaches a policy to an IAM role.
   * @param attachPolicyToRoleRequestDto - DTO with role and policy details.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/attach-policy-to-role')
  async attachPolicyToRole(
    @Body() attachPolicyToRoleRequestDto: AttachPolicyToRoleRequestDto,
  ) {
    const data = await this.awsIamService.attachPolicyToRole(
      attachPolicyToRoleRequestDto,
    );
    return {
      data,
      message: 'AWS policy successfully attached to the Role',
    };
  }

  /**
   * Assumes an IAM role using AWS STS.
   * @param assumeRoleRequestDto - DTO with role assumption details.
   * @returns Temporary credentials.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('sts/assume-role')
  async assumeRole(@Body() assumeRoleRequestDto: AssumeRoleRequestDto) {
    const data = await this.awsStsService.assumeRole(assumeRoleRequestDto);
    return {
      data,
      message: 'AWS Role successfully assumed by User',
    };
  }

  /**
   * Attaches a policy to an IAM user.
   * @param attachPolicyToUserRequestDto - DTO with user and policy details.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/attach-policy-to-user')
  async attachPolicyToUser(
    @Body() attachPolicyToUserRequestDto: AttachPolicyToUserRequestDto,
  ) {
    const data = await this.awsIamService.attachPolicyToUser(
      attachPolicyToUserRequestDto,
    );
    return {
      data,
      message: 'AWS policy successfully attached to the User',
    };
  }

  /**
   * Retrieves all IAM policies.
   * @returns List of policies.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/get-policy')
  async getAllPolicies() {
    const data = await this.awsIamService.getAllPolicies();
    return { data };
  }

  /**
   * Retrieves all IAM roles.
   * @returns List of roles.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/get-roles')
  async getAllRoles() {
    const data = await this.awsIamService.getAllRoles();
    return { data };
  }

  /**
   * Creates a new IAM user.
   * @param createAwsUserRequestDto - DTO with username.
   * @returns Details of the created user.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/create-user')
  async createUser(@Body() createAwsUserRequestDto: CreateAwsUserRequestDto) {
    const data = await this.awsIamService.createUser(
      createAwsUserRequestDto.aws_username,
    );
    return {
      data,
      message: 'New IAM user created successfully',
    };
  }

  /**
   * Creates a login profile for an IAM user.
   * @param createLoginProfileRequestDto - DTO with login profile details.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/create-login-profile')
  async createLoginProfile(
    @Body() createLoginProfileRequestDto: CreateLoginProfileRequestDto,
  ) {
    const { aws_password, aws_username, is_password_reset_required } =
      createLoginProfileRequestDto;
    const data = await this.awsIamService.createLoginProfile(
      aws_username,
      aws_password,
      is_password_reset_required,
    );
    return {
      data,
      message: `Login profile created successfully`,
    };
  }

  /**
   * Lists all access keys for an IAM user.
   * @param awsUsernameRequestDto - DTO with username.
   * @returns List of access keys.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/list-access-keys')
  async listAccessKeys(@Query() awsUsernameRequestDto: AwsUsernameRequestDto) {
    const data = await this.awsIamService.listAccessKeys(
      awsUsernameRequestDto.aws_username,
    );
    return { data };
  }

  /**
   * Retrieves login profile details of an IAM user.
   * @param awsUsernameRequestDto - DTO with username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/get-login-profile')
  async getLoginProfile(@Query() awsUsernameRequestDto: AwsUsernameRequestDto) {
    const data = await this.awsIamService.getLoginProfile(
      awsUsernameRequestDto.aws_username,
    );
    return { data };
  }

  /**
   * Lists attached user policies for an IAM user.
   * @param awsUsernameRequestDto - DTO with username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/list-attached-user-policies')
  async listAttachedUserPolicies(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    const data = await this.awsIamService.listAttachedUserPolicies(
      awsUsernameRequestDto.aws_username,
    );
    return {
      data,
    };
  }

  /**
   * Lists inline user policies for an IAM user.
   * @param awsUsernameRequestDto - DTO with username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/list-inline-user-policies')
  async listUserPolicies(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    const data = await this.awsIamService.listUserPolicies(
      awsUsernameRequestDto.aws_username,
    );
    return {
      data,
    };
  }

  /**
   * Deletes access keys for an IAM user.
   * @param deleteAccessKeysRequestDto - DTO with access key details.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Delete('iam/access-keys')
  async deleteAccessKeys(
    @Query() deleteAccessKeysRequestDto: DeleteAccessKeysRequestDto,
  ) {
    const data = await this.awsIamService.deleteAccessKeys(
      deleteAccessKeysRequestDto.aws_username,
      deleteAccessKeysRequestDto.access_key_id,
    );
    return {
      data,
      message: 'Access keys deleted successfully',
    };
  }

  /**
   * Deletes the login profile for an IAM user.
   * @param username - IAM username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Delete('iam/user-profile/:username')
  async deleteLoginProfile(@Param('username') username: string) {
    const data = await this.awsIamService.deleteLoginProfile(username);
    return {
      data,
      message: 'User profile deleted successfully',
    };
  }

  /**
   * Deletes an IAM user.
   * @param username - IAM username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Delete('iam/user/:username')
  async deleteUser(@Param('username') username: string) {
    const data = await this.awsIamService.deleteUser(username);
    return {
      data,
      message: 'IAM User deleted successfully',
    };
  }

  /**
   * Creates access keys for an IAM user.
   * @param awsUsernameRequestDto - DTO with username.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Post('iam/create-access-keys')
  async createAccessKeys(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    const data = await this.awsIamService.createAccessKeys(
      awsUsernameRequestDto.aws_username,
    );
    return {
      data,
      message: 'Access keys created successfully',
    };
  }

  /**
   * Retrieves temporary console access URL for an IAM user.
   * @param getTemporaryConsoleAccess - DTO with console access details.
   * @returns Console access URL.
   */
  @RolesNeeded()
  @PermissionsNeeded()
  @Get('iam/temporary-console-access')
  async getTemporaryConsoleAccess(
    @Query() getTemporaryConsoleAccess: GetTemporaryConsoleAccess,
  ) {
    const data = await this.awsStsService.getTemporaryConsoleAccess(
      getTemporaryConsoleAccess.role_arn,
      getTemporaryConsoleAccess.session_name,
      getTemporaryConsoleAccess.external_id,
      getTemporaryConsoleAccess.duration_in_seconds,
    );
    return {
      data,
    };
  }
}
