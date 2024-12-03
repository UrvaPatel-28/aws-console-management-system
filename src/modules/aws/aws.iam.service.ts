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
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsIamService {
  private iamClient: IAMClient;
  constructor(
    private readonly awsQueryBuilder: AwsQueryBuilder,
    private readonly configService: ConfigService,
  ) {
    this.iamClient = new IAMClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  /**
   * Creates a custom IAM policy in AWS.
   * This method uses the AWS SDK to send a `CreatePolicyCommand` to the AWS IAM service.
   *
   * @param createPolicyRequestDto - The data transfer object containing details about the policy to be created.
   * @returns The created policy object returned by AWS.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async createPolicy(createPolicyRequestDto: CreatePolicyRequestDto) {
    const { policy_document, policy_name, description, path } =
      createPolicyRequestDto;
    try {
      // Create a new IAM policy command with the provided details
      const createPolicyCommand = new CreatePolicyCommand({
        PolicyDocument: JSON.stringify(policy_document), // Convert policy document to JSON string
        PolicyName: policy_name, // Name of the policy
        Description: description, // Description for the policy
        Path: path, // Organizational path for grouping policies
      });

      // Send the command to the AWS IAM service using the IAM client and return created policy
      return await this.iamClient.send(createPolicyCommand);
    } catch (error) {
      // Throw an HttpException with error details and HTTP status code from AWS response
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Creates a new IAM user in AWS.
   *
   * @param username - The username for the IAM user.
   * @returns The created user's details.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async createUser(username: string) {
    try {
      // Create a new IAM user command with the provided username
      const createUserCommand = new CreateUserCommand({ UserName: username });

      // Send the command to the AWS IAM service
      const user = await this.iamClient.send(createUserCommand);
      // Return the created user
      return user.User;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Creates a login profile for an IAM user to enable AWS Management Console access.
   *
   * @param username - The IAM username.
   * @param password - The password for the user.
   * @param isPasswordResetRequired - Whether the user must reset their password upon first login.
   * @returns The result of the login profile creation command.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Retrieves a list of all IAM policies in the AWS account.
   *
   * @returns An array of policy details.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async getAllPolicies(): Promise<any> {
    try {
      const command = new ListPoliciesCommand({
        Scope: 'Local', // Can be 'AWS', 'Local', or 'All'
        MaxItems: 100,
        // PathPrefix: '/my-path/', // Filter policy by path name
        // OnlyAttached: true, // The list of policies to include only those currently attached to an IAM user, group, or role.
      });

      const response = await this.iamClient.send(command);
      return response.Policies || [];
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Retrieves a list of all IAM roles in the AWS account.
   *
   * @returns An array of role details.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async getAllRoles(): Promise<any> {
    try {
      const command = new ListRolesCommand({});
      const response = await this.iamClient.send(command);
      return response.Roles || [];
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Creates a new IAM role with the provided specifications.
   *
   * @param createRoleRequestDto - The details for creating the IAM role.
   * @returns The details of the created IAM role.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Deletes the login profile of an IAM user, revoking AWS console access.
   *
   * @param username - The IAM username whose login profile is to be deleted.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async deleteLoginProfile(username: string) {
    const command = new DeleteLoginProfileCommand({ UserName: username });
    return await this.iamClient.send(command);
  }

  /**
   * Deletes an IAM user.
   *
   * @param username - The username of the IAM user to delete.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async deleteUser(username: string) {
    try {
      const command2 = new DeleteUserCommand({ UserName: username });
      return await this.iamClient.send(command2);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Deletes an access key for an IAM user.
   *
   * @param username - The username of the IAM user.
   * @param accessKeyId - The access key Id to delete.
   * @throws HttpException if there is an error from the AWS SDK
   */
  async deleteAccessKeys(username: string, accessKeyId: string) {
    try {
      const command2 = new DeleteAccessKeyCommand({
        AccessKeyId: accessKeyId,
        UserName: username,
      });
      return await this.iamClient.send(command2);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Updates the username of an IAM user.
   *
   * @param username - The current username of the IAM user.
   * @param newUsername - The new username to assign.
   * @returns The result of the update command.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Updates the login profile (password) of an IAM user
   *
   * @param username - The IAM username.
   * @param newPassword - The new password to assign.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async updateLoginProfile(username: string, newPassword: string) {
    try {
      const command = new UpdateLoginProfileCommand({
        UserName: username,
        Password: newPassword,
      });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Generates a policy document based on provided actions, conditions, resources, and effect.
   *
   * @param generatePolicyRequestDto - The details for the policy document
   * @returns The JSON representation of the policy document.
   */
  generatePolicyDocument(generatePolicyRequestDto: GeneratePolicyRequestDto) {
    const { actions, conditions, resources, effect } = generatePolicyRequestDto;
    // Construct the policy JSON document
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

  /**
   * Attaches a managed policy to an IAM user.
   *
   * @param attachPolicyToUserRequestDto - Object containing the user's AWS username and the policy ARN.
   * @returns The response from AWS SDK upon successful attachment.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async attachPolicyToUser(
    attachPolicyToUserRequestDto: AttachPolicyToUserRequestDto,
  ): Promise<any> {
    const { policy_arn, aws_username } = attachPolicyToUserRequestDto;
    try {
      const command = new AttachUserPolicyCommand({
        UserName: aws_username,
        PolicyArn: policy_arn,
      });
      const response = await this.iamClient.send(command);
      return response;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Attaches a managed policy to an IAM role.
   *
   * @param attachPolicyToRoleRequestDto - Object containing the role name and the policy ARN.
   * @returns The response from AWS SDK upon successful attachment.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Creates access keys for programmatic access.
   *
   * @param username - The IAM user's username.
   * @returns The access keys generated for the user.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async createAccessKeys(username: string) {
    try {
      const command = new CreateAccessKeyCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Retrieves the list of access keys for an IAM user.
   *
   * @param username - The IAM user's username.
   * @returns Metadata of all access keys associated with the user.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async listAccessKeys(username: string) {
    try {
      const command = new ListAccessKeysCommand({ UserName: username });
      const response = await this.iamClient.send(command);

      return response.AccessKeyMetadata;
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Retrieves the login profile (console access information) of an IAM user.
   *
   * @param username - The IAM user's username.
   * @returns The user's login profile details.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async getLoginProfile(username: string) {
    try {
      const command = new GetLoginProfileCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Retrieves information about an IAM user.
   *
   * @param username - The IAM user's username.
   * @returns Details about the user.
   * @throws HttpException if there is an error from the AWS SDK.
   */
  async getUser(username: string) {
    try {
      const command = new GetUserCommand({ UserName: username });
      return await this.iamClient.send(command);
    } catch (error) {
      throw new HttpException(error, error.$metadata.httpStatusCode);
    }
  }

  /**
   * Updates the status of an IAM user's access key.
   *
   * @param username - The IAM user's username.
   * @param accessKeyId - The Access Key ID to update.
   * @param status - The desired status for the access key ( Active or Inactive).
   * @returns The AWS response for the update action.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Deletes an IAM user's access key.
   *
   * @param username - The IAM user's username.
   * @param accessKeyId - The Access Key Id to delete.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Deletes a managed IAM policy.
   *
   * @param policyArn - The ARN of the policy to delete.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Lists all managed policies attached to an IAM user.
   *
   * @param username - The IAM user's username.
   * @returns A list of attached managed policies.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Detaches a managed policy from an IAM user.
   *
   * @param username - The IAM user's username.
   * @param policyArn - The ARN of the policy to detach.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Lists all inline policies attached to an IAM user.
   *
   * @param username - The IAM user's username.
   * @returns A list of inline policies attached to the user.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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

  /**
   * Deletes an inline policy from an IAM user.
   *
   * @param username - The IAM user's username.
   * @param policyName - The name of the policy to delete.
   * @throws HttpException if there is an error from the AWS SDK.
   */
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
