import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AwsService } from './aws.service';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';
import { AwsS3Service } from './aws.s3.service';
import { AwsStsService } from './aws.sts.service';
import { AwsIamService } from './aws.iam.service';
import {
  AssignRoleRequestDto,
  AssumeRoleRequestDto,
  CreateLoginProfileRequestDto,
  CreatePolicyRequestDto,
  CreateRoleRequestDto,
  CreateAwsUserRequestDto,
  UpdateCredentialRequestDto,
  GeneratePolicyRequestDto,
  AssignPolicyToUserRequestDto,
  AssignPolicyToRoleRequestDto,
  CreateAccessKeyRequestDto,
} from './dto/request.dto';

@Controller('aws')
@ApiBearerAuth()
@ApiTags('Aws')
export class AwsController {
  constructor(
    private readonly awsService: AwsService,
    private readonly awsS3Service: AwsS3Service,
    private readonly awsStsService: AwsStsService,
    private readonly awsIamService: AwsIamService,
  ) {}

  @AllowUnauthorized()
  @Get('temporary-console-access')
  async getTemporaryConsoleAccess(
    @Query('roleArn') roleArn: string,
    @Query('sessionName') sessionName: string,
    @Query('external_id') external_id: string,
  ): Promise<{ consoleUrl: string }> {
    const consoleUrl = await this.awsStsService.getTemporaryConsoleAccess(
      roleArn,
      sessionName,
      external_id,
    );
    return { consoleUrl };
  }

  @AllowUnauthorized()
  @Post('create-policy')
  async createPolicy(@Body() createPolicyRequestDto: CreatePolicyRequestDto) {
    const policy = await this.awsIamService.createPolicy(
      createPolicyRequestDto,
    );
    return { policy };
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

  @Post('create-role')
  async createRole(
    @Body()
    createRoleRequestDto: CreateRoleRequestDto,
  ) {
    const role = await this.awsIamService.createRole(createRoleRequestDto);
    return { success: true, role };
  }

  @Post('assign-role')
  async assignRoleToUser(@Body() assignRoleRequestDto: AssignRoleRequestDto) {
    return await this.awsIamService.assignRoleToUser(assignRoleRequestDto);
  }

  @Post('assume-role')
  async assumeRole(@Body() assumeRoleRequestDto: AssumeRoleRequestDto) {
    return await this.awsStsService.assumeRole(assumeRoleRequestDto);
  }

  @Post('create-user')
  async createUser(@Body() createAwsUserRequestDto: CreateAwsUserRequestDto) {
    return this.awsIamService.createUser(createAwsUserRequestDto.user_name);
  }

  @Post('create-login-profile')
  async createLoginProfile(
    @Body() createLoginProfileRequestDto: CreateLoginProfileRequestDto,
  ) {
    const { username, password, is_password_reset_required } =
      createLoginProfileRequestDto;
    return this.awsIamService.createLoginProfile(
      username,
      password,
      is_password_reset_required,
    );
  }

  @Delete('/user-profile/:username')
  async deleteLoginProfile(@Param('username') username: string) {
    return this.awsIamService.deleteLoginProfile(username);
  }

  @Delete('user/:username')
  async deleteUser(@Param('username') username: string) {
    return this.awsIamService.deleteUser(username);
  }
  @Patch(':username')
  async updateCredential(
    @Body() updateCredentialRequestDto: UpdateCredentialRequestDto,
  ) {
    return this.awsIamService.updateCredential(updateCredentialRequestDto);
  }

  @Post('generate-policy')
  async generatePolicy(
    @Body() generatePolicyRequestDto: GeneratePolicyRequestDto,
  ) {
    return this.awsIamService.generatePolicy(generatePolicyRequestDto);
  }

  @Post('assign-policy-to-user')
  async assignPolicyToUser(
    @Body() assignPolicyToUserRequestDto: AssignPolicyToUserRequestDto,
  ): Promise<any> {
    return this.awsIamService.assignPolicyToUser(assignPolicyToUserRequestDto);
  }

  @Post('assign-policy-to-role')
  async assignPolicyToRole(
    @Body() assignPolicyToRoleRequestDto: AssignPolicyToRoleRequestDto,
  ): Promise<any> {
    return this.awsIamService.assignPolicyToRole(assignPolicyToRoleRequestDto);
  }

  @Post('create-access-keys')
  async createAccessKeys(
    @Body() createAccessKeyRequestDto: CreateAccessKeyRequestDto,
  ) {
    return this.awsIamService.createAccessKeys(
      createAccessKeyRequestDto.username,
    );
  }
}
