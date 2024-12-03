import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserQueryBuilder } from './user.query.builder';
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
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AwsIamService } from '../aws/aws.iam.service';
import { AwsStsService } from '../aws/aws.sts.service';
import { DataSource, QueryFailedError } from 'typeorm';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';
import { UUID } from 'crypto';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    private readonly userQueryBuilder: UserQueryBuilder,
    private readonly awsIamService: AwsIamService,
    private readonly awsStsService: AwsStsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new user.
   * @param createUserRequestDto - Data transfer object for creating a user.
   */
  async createUser(createUserRequestDto: CreateUserRequestDto) {
    return await this.userQueryBuilder
      .createUser(createUserRequestDto)
      .catch(this.handleAddUserExceptions);
  }

  /**
   * Get the list of all users.
   */
  async getUsers() {
    return await this.userQueryBuilder.getUsers();
  }

  /**
   * Get details of a specific user.
   * @param userId - UUID of the user.
   */
  async getUserDetails(userId: UUID) {
    return await this.userQueryBuilder.getUserDetails(userId);
  }

  /**
   * Update an existing user.
   * @param updateUserRequestDto - Data transfer object for updating a user.
   * @param userId - UUID of the user to update.
   */
  async updateUser(updateUserRequestDto: UpdateUserRequestDto, userId: UUID) {
    return await this.userQueryBuilder
      .updateUser(updateUserRequestDto, userId)
      .catch(this.handleAddUserExceptions);
  }

  /**
   * Create AWS Console credentials for a user.
   * @param addAwsConsoleCredentialsRequestDto - DTO with AWS Console credential details.
   * @param user - User context passed from the decorator.
   * @throws Appropriate error messages if any operation fails during the transaction.
   */
  async createAwsConsoleCredentials(
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_password, aws_username, is_password_reset_required } =
      addAwsConsoleCredentialsRequestDto;

    try {
      // Start a database transaction
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // Save AWS Console credential details into the database
        await this.userQueryBuilder.createAwsConsoleCredentials(
          transactionalEntityManager,
          addAwsConsoleCredentialsRequestDto,
          user,
        );

        // Create an IAM user in AWS with the provided username
        await this.awsIamService.createUser(aws_username);

        // Create a login profile for the IAM user with a password and optional password reset requirement
        await this.awsIamService.createLoginProfile(
          aws_username,
          aws_password,
          is_password_reset_required,
        );
      });
    } catch (error) {
      // Handle exceptions and map errors to appropriate responses
      this.handleCreateConsoleUserExceptions(error);
    }
  }

  /**
   * Update AWS Console credentials for a user.
   * @param updateAwsConsoleCredentialsRequestDto - Data transfer object for updating AWS Console credentials.
   * @param user - User context passed from the decorator.
   */
  async updateAwsConsoleCredentials(
    updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_new_username, aws_username, aws_new_password } =
      updateAwsConsoleCredentialsRequestDto;
    let awsUsername = aws_username;
    try {
      // Start a database transaction
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // Update AWS Console credentials into the database
        await this.userQueryBuilder.updateAwsConsoleCredentials(
          transactionalEntityManager,
          updateAwsConsoleCredentialsRequestDto,
          user,
        );

        // If a new username is provided, update the IAM user in AWS
        if (aws_new_username) {
          await this.awsIamService.updateUser(aws_username, aws_new_username);
          awsUsername = aws_new_username;
        }

        // If a new password is provided, update the IAM login profile in AWS
        if (aws_new_password) {
          await this.awsIamService.updateLoginProfile(
            awsUsername,
            aws_new_password,
          );
        }
      });
    } catch (error) {
      // Handle exceptions and map errors to appropriate responses
      this.handleCreateConsoleUserExceptions(error);
    }
  }

  /**
   * Delete AWS Console credentials for a user.
   * @param deleteAwsConsoleCredentialsRequestDto - Data transfer object for deleting AWS Console credentials.
   */
  async deleteAwsConsoleCredentials(
    deleteAwsConsoleCredentialsRequestDto: DeleteAwsConsoleCredentialsRequestDto,
  ) {
    const { aws_username } = deleteAwsConsoleCredentialsRequestDto;

    try {
      // Start a database transaction
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // Delete AWS Console credentials from the  database
        await this.userQueryBuilder.deleteAwsConsoleCredentials(
          transactionalEntityManager,
          deleteAwsConsoleCredentialsRequestDto.aws_username,
        );

        // Verify the user exists in AWS IAM by retrieving user details
        await this.awsIamService.getUser(aws_username);

        // List the access keys associated with the user
        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);

        // Check if a login profile exists for the user
        const isLoginProfileExist =
          await this.awsIamService.getLoginProfile(aws_username);

        // List attached policies (managed policies) to the IAM user
        const attachedPolicies =
          await this.awsIamService.listAttachedUserPolicies(aws_username);

        // List inline policies associated with the IAM user
        const inlinePolicies =
          await this.awsIamService.listUserPolicies(aws_username);

        //  Delete Access Keys associated with the user
        for (const accessKey of accessKeyMetadata) {
          await this.awsIamService.deleteAccessKeys(
            accessKey.UserName,
            accessKey.AccessKeyId,
          );
        }

        //  Delete the Login Profile if it exists
        if (isLoginProfileExist)
          await this.awsIamService.deleteLoginProfile(aws_username);

        // Detach all attached managed policies from the user
        for (const policy of attachedPolicies.AttachedPolicies || []) {
          await this.awsIamService.detachUserPolicy(
            aws_username,
            policy.PolicyArn,
          );
        }

        // Delete all inline policies associated with the user
        for (const policyName of inlinePolicies.PolicyNames || []) {
          await this.awsIamService.deleteUserPolicy(aws_username, policyName);
        }

        // Finally, delete the IAM user
        await this.awsIamService.deleteUser(aws_username);
      });
    } catch (error) {
      // Rethrow the error if any exception occurs during the transaction
      throw error;
    }
  }

  /**
   * Create programmatic credentials for AWS services.
   * @param createProgrammaticCredentialsRequestDto - Data transfer object for creating AWS programmatic credentials.
   * @param user - User context passed from the decorator.
   */
  async createProgrammaticCredentials(
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, expiration_time } =
      createProgrammaticCredentialsRequestDto;
    try {
      // Create AWS programmatic access keys for the specified IAM user
      const programmaticCredentials =
        await this.awsIamService.createAccessKeys(aws_username);

      // Extract Access Key ID, Secret Access Key, and Status from the response
      const { AccessKeyId, SecretAccessKey, Status } =
        programmaticCredentials.AccessKey;

      // Store the generated access keys and associated details intp the database
      return await this.userQueryBuilder.createProgrammaticCredentials(
        AccessKeyId,
        SecretAccessKey,
        Status as AwsAccessKeysStatusEnum, // Status of the access key (Active/Inactive)
        expiration_time, // Expiration time for the credentials
        aws_username,
        user,
      );
    } catch (error) {
      //  Handle database-related errors
      if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23503 &&
        error.driverError.constraint ==
          'FK_aws_programmatic_credentials_created_by'
      ) {
        throw new NotFoundException('User not found in database');
      }
      throw error;
    }
  }

  /**
   * Update programmatic credentials for AWS services.
   * @param updateProgrammaticCredentialsRequestDto - Data transfer object for updating AWS programmatic credentials status.
   * @param user - User context passed from the decorator.
   * @returns
   */
  async updateAwsProgrammaticCredentials(
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, status } = updateProgrammaticCredentialsRequestDto;
    try {
      // Start a database transaction
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // Update the programmatic credentials details in the database
        await this.userQueryBuilder.updateAwsProgrammaticCredentials(
          transactionalEntityManager,
          updateProgrammaticCredentialsRequestDto,
          user,
        );

        // List all access keys associated with the specified AWS username
        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);

        // Loop through each access key and update its status
        for (const accessKey of accessKeyMetadata) {
          // Update the status of each access key (Active/Inactive)
          await this.awsIamService.updateAccessKeys(
            accessKey.UserName,
            accessKey.AccessKeyId,
            status,
          );
        }
      });
    } catch (error) {
      // Handle database-related errors
      if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23503 &&
        error.driverError.constraint ==
          'FK_aws_programmatic_credentials_updated_by'
      ) {
        throw new NotFoundException('User not found in database');
      }
      throw error;
    }
  }

  /**
   * Delete programmatic credentials for AWS services.
   * @param deleteProgrammaticCredentialsRequestDto - Data transfer object for deleting AWS programmatic credentials status.
   * @returns
   */
  async deleteProgrammaticCredentials(
    deleteProgrammaticCredentialsRequestDto: DeleteProgrammaticCredentialsRequestDto,
  ) {
    const { aws_username } = deleteProgrammaticCredentialsRequestDto;
    try {
      // Start a database transaction
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        // Delete the programmatic credentials from the database
        await this.userQueryBuilder.deleteProgrammaticCredentials(
          transactionalEntityManager,
          deleteProgrammaticCredentialsRequestDto.aws_username,
        );

        //  List all access keys associated with the specified AWS username
        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);

        // Loop through each access key and delete it from AWS
        for (const accessKey of accessKeyMetadata) {
          // Delete the access key from AWS Iam
          await this.awsIamService.deleteAccessKey(
            accessKey.UserName,
            accessKey.AccessKeyId,
          );
        }
      });
    } catch (error) {
      // Handle and throw any error that occurs during the deletion process
      throw error;
    }
  }

  /**
   * List all AWS Console credentials.
   */
  async listAwsConsoleCredentials() {
    return await this.userQueryBuilder.listAwsConsoleCredentials();
  }

  /**
   * List all AWS programmatic credentials.
   */
  async listAwsProgrammaticCredentials() {
    return await this.userQueryBuilder.listAwsProgrammaticCredentials();
  }

  /**
   * Handles specific SQL query errors related to constraints and throws appropriate exceptions.
   * This is used to catch database-specific errors and return user-friendly messages based on the error type.
   *
   * @param error - The error object that was caught during the query execution.
   * @throws Throws a specific exception depending on the error encountered.
   */
  private handleAddUserExceptions(error) {
    if (
      error instanceof QueryFailedError &&
      error.driverError.code == 23503 &&
      error.driverError.constraint == 'FK_user_role_id'
    ) {
      throw new NotFoundException('Role not found');
    } else if (
      error instanceof QueryFailedError &&
      error.driverError.code == 23505 &&
      error.driverError.constraint == 'UQ_user_email'
    ) {
      throw new ConflictException('Email already exist');
    } else if (
      error instanceof QueryFailedError &&
      error.driverError.code == 23505 &&
      error.driverError.constraint == 'UQ_user_username'
    ) {
      throw new ConflictException('Username already exist');
    }
    throw error;
  }

  /**
   * Handles specific SQL query errors related to constraints and throws appropriate exceptions.
   * This is used to catch database-specific errors and return user-friendly messages based on the error type.
   *
   * @param error - The error object that was caught during the query execution.
   * @throws Throws a specific exception depending on the error encountered.
   */
  private handleCreateConsoleUserExceptions(error) {
    if (
      error instanceof QueryFailedError &&
      error.driverError.code == 23503 &&
      error.driverError.constraint == 'FK_aws_console_credentials_created_by'
    ) {
      throw new NotFoundException('User not found in database');
    } else if (
      error instanceof QueryFailedError &&
      error.driverError.code == 23505 &&
      error.driverError.constraint == 'UQ_aws_console_credentials_aws_username'
    ) {
      throw new NotFoundException('Username is already exist');
    }
    throw error;
  }
}
