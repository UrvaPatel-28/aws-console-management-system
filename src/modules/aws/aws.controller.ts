import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AwsService } from './aws.service';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';
import { AwsS3Service } from './aws.s3.service';
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
@ApiBearerAuth()
@ApiTags('Aws')
@RolesNeeded(RoleEnum.Admin, RoleEnum.TeamLeader)
@PermissionsNeeded()
export class AwsController {
  constructor(
    private readonly awsService: AwsService,
    private readonly awsS3Service: AwsS3Service,
    private readonly awsStsService: AwsStsService,
    private readonly awsIamService: AwsIamService,
  ) {}

  /**
   * Get all users from the database.
   */
  @AllowUnauthorized()
  @Post('create-policy')
  async createPolicy(@Body() createPolicyRequestDto: CreatePolicyRequestDto) {
    const policy = await this.awsIamService.createPolicy(
      createPolicyRequestDto,
    );
    return { policy };
  }

  @AllowUnauthorized()
  @Post('generate-policy-document')
  generatePolicyDocument(
    @Body() generatePolicyRequestDto: GeneratePolicyRequestDto,
  ) {
    return this.awsIamService.generatePolicyDocument(generatePolicyRequestDto);
  }

  @AllowUnauthorized()
  @Post('create-role')
  async createRole(
    @Body()
    createRoleRequestDto: CreateRoleRequestDto,
  ) {
    const role = await this.awsIamService.createRole(createRoleRequestDto);
    return { success: true, role };
  }

  @AllowUnauthorized()
  @Post('attach-policy-to-role')
  async attachPolicyToRole(
    @Body() attachPolicyToRoleRequestDto: AttachPolicyToRoleRequestDto,
  ) {
    return this.awsIamService.attachPolicyToRole(attachPolicyToRoleRequestDto);
  }

  @AllowUnauthorized()
  @Post('assume-role')
  async assumeRole(@Body() assumeRoleRequestDto: AssumeRoleRequestDto) {
    return await this.awsStsService.assumeRole(assumeRoleRequestDto);
  }

  @AllowUnauthorized()
  @Post('attach-policy-to-user')
  async attachPolicyToUser(
    @Body() attachPolicyToUserRequestDto: AttachPolicyToUserRequestDto,
  ) {
    return this.awsIamService.attachPolicyToUser(attachPolicyToUserRequestDto);
  }

  @AllowUnauthorized()
  @Get('get-policy')
  async getAllPolicies() {
    const policy = await this.awsIamService.getAllPolicies();
    return { policy };
  }

  @AllowUnauthorized()
  @Get('get-roles')
  async getAllRoles() {
    const roles = await this.awsIamService.getAllRoles();
    return { roles };
  }

  @Post('create-user')
  async createUser(@Body() createAwsUserRequestDto: CreateAwsUserRequestDto) {
    return this.awsIamService.createUser(createAwsUserRequestDto.aws_username);
  }

  @Post('create-login-profile')
  async createLoginProfile(
    @Body() createLoginProfileRequestDto: CreateLoginProfileRequestDto,
  ) {
    const { aws_password, aws_username, is_password_reset_required } =
      createLoginProfileRequestDto;
    return this.awsIamService.createLoginProfile(
      aws_username,
      aws_password,
      is_password_reset_required,
    );
  }

  @AllowUnauthorized()
  @Get('list-access-keys')
  async listAccessKeys(@Query() awsUsernameRequestDto: AwsUsernameRequestDto) {
    return await this.awsIamService.listAccessKeys(
      awsUsernameRequestDto.aws_username,
    );
  }

  @AllowUnauthorized()
  @Get('get-login-profile')
  async getLoginProfile(@Query() awsUsernameRequestDto: AwsUsernameRequestDto) {
    return await this.awsIamService.getLoginProfile(
      awsUsernameRequestDto.aws_username,
    );
  }

  @AllowUnauthorized()
  @Get('list-attached-user-policies')
  async listAttachedUserPolicies(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    return await this.awsIamService.listAttachedUserPolicies(
      awsUsernameRequestDto.aws_username,
    );
  }

  @AllowUnauthorized()
  @Get('list-inline-user-policies')
  async listUserPolicies(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    return await this.awsIamService.listUserPolicies(
      awsUsernameRequestDto.aws_username,
    );
  }

  @Delete('access-keys')
  async deleteAccessKeys(
    @Query() deleteAccessKeysRequestDto: DeleteAccessKeysRequestDto,
  ) {
    return this.awsIamService.deleteAccessKeys(
      deleteAccessKeysRequestDto.username,
      deleteAccessKeysRequestDto.access_key_id,
    );
  }

  // @Delete('user-profile/:username')
  // async deleteLoginProfile(@Param('username') username: string) {
  //   return this.awsIamService.deleteLoginProfile(username);
  // }

  // @Delete('user/:username')
  // async deleteUser(@Param('username') username: string) {
  //   return this.awsIamService.deleteUser(username);
  // }

  @Post('create-access-keys')
  async createAccessKeys(
    @Query() awsUsernameRequestDto: AwsUsernameRequestDto,
  ) {
    return this.awsIamService.createAccessKeys(
      awsUsernameRequestDto.aws_username,
    );
  }

  @Get('temporary-console-access')
  async getTemporaryConsoleAccess(
    getTemporaryConsoleAccess: GetTemporaryConsoleAccess,
  ) {
    return await this.awsStsService.getTemporaryConsoleAccess(
      getTemporaryConsoleAccess.role_arn,
      getTemporaryConsoleAccess.session_name,
      getTemporaryConsoleAccess.external_id,
    );
  }
}
