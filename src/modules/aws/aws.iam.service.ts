import { HttpException, Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';
import {
  AttachRolePolicyCommand,
  AttachUserPolicyCommand,
  CreateAccessKeyCommand,
  CreateLoginProfileCommand,
  CreatePolicyCommand,
  CreateRoleCommand,
  CreateUserCommand,
  DeleteAccessKeyCommand,
  DeleteLoginProfileCommand,
  DeletePolicyCommand,
  DeleteUserCommand,
  DeleteUserPolicyCommand,
  DetachUserPolicyCommand,
  GetLoginProfileCommand,
  GetUserCommand,
  IAMClient,
  ListAccessKeysCommand,
  ListAttachedUserPoliciesCommand,
  ListPoliciesCommand,
  ListRolesCommand,
  ListUserPoliciesCommand,
  UpdateAccessKeyCommand,
  UpdateLoginProfileCommand,
  UpdateUserCommand,
} from '@aws-sdk/client-iam';
import {
  CreatePolicyRequestDto,
  CreateRoleRequestDto,
  GeneratePolicyRequestDto,
  AttachPolicyToUserRequestDto,
  AttachPolicyToRoleRequestDto,
} from './dto/request.dto';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';

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

  async createPolicy(createPolicyRequestDto: CreatePolicyRequestDto) {
    const { policy_document, policy_name } = createPolicyRequestDto;
    try {
      const createPolicyCommand = new CreatePolicyCommand({
        PolicyDocument: JSON.stringify(policy_document),
        PolicyName: policy_name,
        Description: 'This is description',
        // Path: '/my-path/', //this is no affect any functionality, this only change arn like: arn:aws:iam::905418466860:policy/my-path/stspolicy2 && this used for organize and manage IAM resources
      });
      const policy = await this.iamClient.send(createPolicyCommand);
      return policy;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async createUser(username: string) {
    try {
      const createUserCommand = new CreateUserCommand({ UserName: username });
      const user = await this.iamClient.send(createUserCommand);
      return user.User;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
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
        PasswordResetRequired: isPasswordResetRequired,
      });
      return await this.iamClient.send(createUserCommand);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
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
      return response.Policies || [];
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async getAllRoles(): Promise<any> {
    try {
      const command = new ListRolesCommand({});
      const response = await this.iamClient.send(command);
      return response.Roles || [];
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async createRole(createRoleRequestDto: CreateRoleRequestDto) {
    const { assume_role_policy_document, role_name, description, path, tags } =
      createRoleRequestDto;
    try {
      const command = new CreateRoleCommand({
        RoleName: role_name,
        AssumeRolePolicyDocument: JSON.stringify(assume_role_policy_document),
        Description: description,
        Path: path,
        Tags: tags,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async deleteLoginProfile(username: string): Promise<void> {
    const command = new DeleteLoginProfileCommand({ UserName: username });
    await this.iamClient.send(command);
  }

  async deleteUser(username: string): Promise<void> {
    try {
      const command2 = new DeleteUserCommand({ UserName: username });
      await this.iamClient.send(command2);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async deleteAccessKeys(username: string, accessKeyId: string): Promise<void> {
    try {
      const command2 = new DeleteAccessKeyCommand({
        AccessKeyId: accessKeyId,
        UserName: username,
      });
      await this.iamClient.send(command2);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async updateUser(username: string, newUsername: string) {
    try {
      const command = new UpdateUserCommand({
        UserName: username,
        NewUserName: newUsername,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async updateLoginProfile(
    username: string,
    newPassword: string,
  ): Promise<void> {
    try {
      const command = new UpdateLoginProfileCommand({
        UserName: username,
        Password: newPassword,
      });
      await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  generatePolicyDocument(generatePolicyRequestDto: GeneratePolicyRequestDto) {
    const { actions, conditions, resources, effect } = generatePolicyRequestDto;
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
    return policyDocument;
  }

  async attachPolicyToUser(
    attachPolicyToUserRequestDto: AttachPolicyToUserRequestDto,
  ): Promise<any> {
    const { policy_arn, username } = attachPolicyToUserRequestDto;
    try {
      const command = new AttachUserPolicyCommand({
        UserName: username,
        PolicyArn: policy_arn,
      });
      const response = await this.iamClient.send(command);
      return response;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async attachPolicyToRole(
    attachPolicyToRoleRequestDto: AttachPolicyToRoleRequestDto,
  ): Promise<any> {
    const { role_name, policy_arn } = attachPolicyToRoleRequestDto;

    try {
      const command = new AttachRolePolicyCommand({
        RoleName: role_name,
        PolicyArn: policy_arn,
      });

      const response = await this.iamClient.send(command);
      return response;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async createAccessKeys(username: string) {
    try {
      const command = new CreateAccessKeyCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async listAccessKeys(username: string) {
    try {
      const command = new ListAccessKeysCommand({ UserName: username });
      const response = await this.iamClient.send(command);

      return response.AccessKeyMetadata;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async getLogingProfile(username: string) {
    try {
      const command = new GetLoginProfileCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async getUser(username: string) {
    try {
      const command = new GetUserCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async updateAccessKeys(
    username: string,
    accessKeyId: string,
    status: AwsAccessKeysStatusEnum,
  ) {
    try {
      const command = new UpdateAccessKeyCommand({
        AccessKeyId: accessKeyId,
        Status: status,
        UserName: username,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async deleteAccessKey(username: string, accessKeyId: string) {
    try {
      const command = new DeleteAccessKeyCommand({
        AccessKeyId: accessKeyId,
        UserName: username,
      });
      await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async deletePolicy(policyArn: string) {
    try {
      const command = new DeletePolicyCommand({
        PolicyArn: policyArn,
      });
      await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async listAttachedUserPolicies(username: string) {
    try {
      const command = new ListAttachedUserPoliciesCommand({
        UserName: username,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async detachUserPolicy(username: string, policyArn: string) {
    try {
      const command = new DetachUserPolicyCommand({
        PolicyArn: policyArn,
        UserName: username,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async listUserPolicies(username: string) {
    try {
      const command = new ListUserPoliciesCommand({
        UserName: username,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  async deleteUserPolicy(username: string, policyName: string) {
    try {
      const command = new DeleteUserPolicyCommand({
        PolicyName: policyName,
        UserName: username,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }
}
