import { Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';
import {
  AttachRolePolicyCommand,
  AttachUserPolicyCommand,
  CreateAccessKeyCommand,
  CreateLoginProfileCommand,
  CreatePolicyCommand,
  CreateRoleCommand,
  CreateUserCommand,
  DeleteLoginProfileCommand,
  DeleteUserCommand,
  IAMClient,
  ListPoliciesCommand,
  ListRolesCommand,
  UpdateLoginProfileCommand,
} from '@aws-sdk/client-iam';
import {
  AssignRoleRequestDto,
  CreatePolicyRequestDto,
  CreateRoleRequestDto,
  UpdateCredentialRequestDto,
  GeneratePolicyRequestDto,
  AssignPolicyToUserRequestDto,
  AssignPolicyToRoleRequestDto,
} from './dto/request.dto';

@Injectable()
export class AwsIamService {
  private iamClient: IAMClient;
  constructor(private readonly awsQueryBuilder: AwsQueryBuilder) {
    this.iamClient = new IAMClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async createUser(username: string) {
    try {
      const createUserCommand = new CreateUserCommand({ UserName: username });
      const user = await this.iamClient.send(createUserCommand);
      return user.User;
    } catch (error) {
      throw new Error(`Error creating temporary user: ${error.message}`);
    }
  }

  async createLoginProfile(
    username: string,
    password: string,
    isPasswordResetRequired: boolean,
  ) {
    try {
      const createUserCommand = new CreateLoginProfileCommand({
        UserName: username,
        Password: password,
        PasswordResetRequired: isPasswordResetRequired, // Force password reset on first login
      });
      return await this.iamClient.send(createUserCommand);
    } catch (error) {
      throw new Error(`Error creating temporary user: ${error.message}`);
    }
  }

  async createPolicy(createPolicyRequestDto: CreatePolicyRequestDto) {
    const { policy_document, policy_name } = createPolicyRequestDto;
    try {
      const createPolicyCommand = new CreatePolicyCommand({
        PolicyDocument: JSON.stringify(policy_document),
        PolicyName: policy_name,
        Description: 'this is description',
        // Path: '/my-path/', //this is no affect any functionality, this only change arn like : arn:aws:iam::905418466860:policy/my-path/stspolicy2 && this used for organize and manage IAM resources
      });
      const policy = await this.iamClient.send(createPolicyCommand);
      console.log(policy);
      return policy;
    } catch (error) {
      console.log(error);

      throw new Error(`Error creating temporary user: ${error.message}`);
    }
  }

  async getAllPolicies(): Promise<any> {
    try {
      const command = new ListPoliciesCommand({
        Scope: 'Local', // can be 'AWS', 'Local', or 'All'
        MaxItems: 1000,
        // PathPrefix: '/my-path/', // filter policy by path name
        // OnlyAttached: true, // the list of policies to include only those currently attached to an IAM user, group, or role.
      });

      const response = await this.iamClient.send(command);
      console.log(response);

      return response.Policies || [];
    } catch (error) {
      throw new Error(`Error fetching AWS policies: ${error.message}`);
    }
  }

  async getAllRoles(): Promise<any> {
    try {
      const command = new ListRolesCommand({});

      const response = await this.iamClient.send(command);
      console.log(response);

      return response.Roles || [];
    } catch (error) {
      throw new Error(`Error fetching AWS roles: ${error.message}`);
    }
  }

  async createRole(createRoleRequestDto: CreateRoleRequestDto): Promise<any> {
    const { assume_role_policy_document, role_name } = createRoleRequestDto;
    try {
      const command = new CreateRoleCommand({
        RoleName: role_name,
        AssumeRolePolicyDocument: JSON.stringify(assume_role_policy_document),
      });
      const response = await this.iamClient.send(command);
      return response.Role;
    } catch (error) {
      throw new Error(`Error creating role: ${error.message}`);
    }
  }

  async assignRoleToUser(
    assignRoleRequestDto: AssignRoleRequestDto,
  ): Promise<string> {
    const { roleArn, userName } = assignRoleRequestDto;
    try {
      // Attach the role policy to the user
      const attachRolePolicyCommand = new AttachRolePolicyCommand({
        RoleName: roleArn,
        PolicyArn: `arn:aws:iam::aws:policy/${roleArn}`, // Adjust this as needed
      });

      await this.iamClient.send(attachRolePolicyCommand);
      return `Role ${roleArn} successfully assigned to user ${userName}`;
    } catch (error) {
      console.log(error);

      throw new Error(`Failed to assign role to user: ${error.message}`);
    }
  }

  async deleteLoginProfile(username: string): Promise<void> {
    const command = new DeleteLoginProfileCommand({ UserName: username });
    const result = await this.iamClient.send(command);
    console.log(result);
  }

  async deleteUser(username: string): Promise<void> {
    const command2 = new DeleteUserCommand({ UserName: username });
    const hi = await this.iamClient.send(command2);
    console.log(hi);
  }

  async updateCredential(
    updateCredentialRequestDto: UpdateCredentialRequestDto,
  ): Promise<void> {
    const { is_password_reset, newPassword, username } =
      updateCredentialRequestDto;
    const command = new UpdateLoginProfileCommand({
      UserName: username,
      Password: newPassword,
      PasswordResetRequired: is_password_reset,
    });
    await this.iamClient.send(command);
  }

  async generatePolicy(generatePolicyRequestDto: GeneratePolicyRequestDto) {
    const { actions, conditions, resources, name, effect } =
      generatePolicyRequestDto;
    try {
      // construct the policy JSON document
      const policyDocument = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: effect,
            Action: actions,
            Resource: resources,
            Condition: conditions ? conditions : undefined,
          },
        ],
      };

      const command = new CreatePolicyCommand({
        PolicyName: name,
        PolicyDocument: JSON.stringify(policyDocument),
      });

      const response = await this.iamClient.send(command);

      return response;
    } catch (error) {
      console.error('Error creating policy:', error);
      throw error;
    }
  }

  async assignPolicyToUser(
    assignPolicyToUserRequestDto: AssignPolicyToUserRequestDto,
  ): Promise<any> {
    const { policy_arn, username } = assignPolicyToUserRequestDto;

    try {
      const command = new AttachUserPolicyCommand({
        UserName: username,
        PolicyArn: policy_arn,
      });

      const response = await this.iamClient.send(command);
      return response;
    } catch (error) {
      console.error('Error attaching policy to user:', error);
      throw error;
    }
  }

  async assignPolicyToRole(
    assignPolicyToRoleRequestDto: AssignPolicyToRoleRequestDto,
  ): Promise<any> {
    const { role_name, policy_arn } = assignPolicyToRoleRequestDto;

    try {
      const command = new AttachRolePolicyCommand({
        RoleName: role_name,
        PolicyArn: policy_arn,
      });

      const response = await this.iamClient.send(command);
      return response;
    } catch (error) {
      console.error('Error attaching policy to role:', error);
      throw error;
    }
  }

  async createAccessKeys(username: string) {
    try {
      const command = new CreateAccessKeyCommand({ UserName: username });
      const response = await this.iamClient.send(command);
      return {
        AccessKeyId: response.AccessKey.AccessKeyId,
        SecretAccessKey: response.AccessKey.SecretAccessKey,
      };
    } catch (error) {
      console.error('Error while creating access keys:', error);
      throw error;
    }
  }
}
