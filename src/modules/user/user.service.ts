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

  async createUser(createUserRequestDto: CreateUserRequestDto) {
    try {
      return await this.userQueryBuilder.createUser(createUserRequestDto);
    } catch (error) {
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
  }

  async getUsers() {
    return await this.userQueryBuilder.getUsers();
  }

  async getUserDetails(userId: UUID) {
    return await this.userQueryBuilder.getUserDetails(userId);
  }

  async updateUser(updateUserRequestDto: UpdateUserRequestDto, userId: UUID) {
    try {
      return await this.userQueryBuilder.updateUser(
        updateUserRequestDto,
        userId,
      );
    } catch (error) {
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
  }

  async createAwsConsoleCredentials(
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_password, aws_username, is_password_reset_required } =
      addAwsConsoleCredentialsRequestDto;

    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.userQueryBuilder.createAwsConsoleCredentials(
          transactionalEntityManager,
          addAwsConsoleCredentialsRequestDto,
          user,
        );
        await this.awsIamService.createUser(aws_username);
        await this.awsIamService.createLoginProfile(
          aws_username,
          aws_password,
          is_password_reset_required,
        );
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23503 &&
        error.driverError.constraint == 'FK_aws_console_credentials_created_by'
      ) {
        throw new NotFoundException('User not found in database');
      } else if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23505 &&
        error.driverError.constraint ==
          'UQ_aws_console_credentials_aws_username'
      ) {
        throw new NotFoundException('Username is already exist');
      }
      throw error;
    }
  }

  async updateAwsConsoleCredentials(
    updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_new_username, aws_username, aws_new_password } =
      updateAwsConsoleCredentialsRequestDto;
    let awsUsername = aws_username;
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.userQueryBuilder.updateAwsConsoleCredentials(
          transactionalEntityManager,
          updateAwsConsoleCredentialsRequestDto,
          user,
        );

        if (aws_new_username) {
          await this.awsIamService.updateUser(aws_username, aws_new_username);
          awsUsername = aws_new_username;
        }
        if (aws_new_password) {
          await this.awsIamService.updateLoginProfile(
            awsUsername,
            aws_new_password,
          );
        }
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23503 &&
        error.driverError.constraint == 'FK_aws_console_credentials_updated_by'
      ) {
        throw new NotFoundException('User not found in database');
      } else if (
        error instanceof QueryFailedError &&
        error.driverError.code == 23505 &&
        error.driverError.constraint ==
          'UQ_aws_console_credentials_aws_username'
      ) {
        throw new NotFoundException('Username is already exist');
      }
      throw error;
    }
  }

  async deleteAwsConsoleCredentials(
    deleteAwsConsoleCredentialsRequestDto: DeleteAwsConsoleCredentialsRequestDto,
  ) {
    const { aws_username } = deleteAwsConsoleCredentialsRequestDto;

    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.userQueryBuilder.deleteAwsConsoleCredentials(
          transactionalEntityManager,
          deleteAwsConsoleCredentialsRequestDto.aws_username,
        );

        await this.awsIamService.getUser(aws_username);

        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);
        const isLoginProfileExist =
          await this.awsIamService.getLoginProfile(aws_username);
        const attachedPolicies =
          await this.awsIamService.listAttachedUserPolicies(aws_username);
        const inlinePolicies =
          await this.awsIamService.listUserPolicies(aws_username);

        //Delete Access Keys
        for (const accessKey of accessKeyMetadata) {
          await this.awsIamService.deleteAccessKeys(
            accessKey.UserName,
            accessKey.AccessKeyId,
          );
        }

        //Delete Login Profile
        if (isLoginProfileExist)
          await this.awsIamService.deleteLoginProfile(aws_username);

        for (const policy of attachedPolicies.AttachedPolicies || []) {
          await this.awsIamService.detachUserPolicy(
            aws_username,
            policy.PolicyArn,
          );
        }

        for (const policyName of inlinePolicies.PolicyNames || []) {
          await this.awsIamService.deleteUserPolicy(aws_username, policyName);
        }

        //Delete User
        await this.awsIamService.deleteUser(aws_username);
      });
    } catch (error) {
      throw error;
    }
  }

  async createProgrammaticCredentials(
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, expiration_time } =
      createProgrammaticCredentialsRequestDto;
    try {
      const programmaticCredentials =
        await this.awsIamService.createAccessKeys(aws_username);

      const { AccessKeyId, SecretAccessKey, Status } =
        programmaticCredentials.AccessKey;

      return await this.userQueryBuilder.createProgrammaticCredentials(
        AccessKeyId,
        SecretAccessKey,
        Status as AwsAccessKeysStatusEnum,
        expiration_time,
        aws_username,
        user,
      );
    } catch (error) {
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

  async updateAwsProgrammaticCredentials(
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, status } = updateProgrammaticCredentialsRequestDto;
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.userQueryBuilder.updateAwsProgrammaticCredentials(
          transactionalEntityManager,
          updateProgrammaticCredentialsRequestDto,
          user,
        );

        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);

        for (const accessKey of accessKeyMetadata) {
          await this.awsIamService.updateAccessKeys(
            accessKey.UserName,
            accessKey.AccessKeyId,
            status,
          );
        }
      });
    } catch (error) {
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

  async deleteProgrammaticCredentials(
    deleteProgrammaticCredentialsRequestDto: DeleteProgrammaticCredentialsRequestDto,
  ) {
    const { aws_username } = deleteProgrammaticCredentialsRequestDto;
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        await this.userQueryBuilder.deleteProgrammaticCredentials(
          transactionalEntityManager,
          deleteProgrammaticCredentialsRequestDto.aws_username,
        );

        const accessKeyMetadata =
          await this.awsIamService.listAccessKeys(aws_username);

        for (const accessKey of accessKeyMetadata) {
          await this.awsIamService.deleteAccessKey(
            accessKey.UserName,
            accessKey.AccessKeyId,
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async listAwsConsoleCredentials() {
    return await this.userQueryBuilder.listAwsConsoleCredentials();
  }

  async listAwsProgrammaticCredentials() {
    return await this.userQueryBuilder.listAwsProgrammaticCredentials();
  }
}
