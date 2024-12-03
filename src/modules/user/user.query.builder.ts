import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, EntityManager } from 'typeorm';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateUserRequestDto,
  UpdateAwsConsoleCredentialsRequestDto,
  UpdateProgrammaticCredentialsRequestDto,
  UpdateUserRequestDto,
} from './dto/request.dto';
import { hash } from 'bcrypt';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AwsProgrammaticCredentials } from 'src/entities/aws-programmatic-credentials.entity';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';
import { UUID } from 'crypto';
import { Role } from 'src/entities/role.entity';

@Injectable()
export class UserQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new user.
   * @param createUserRequestDto - Data transfer object for creating a user.
   */
  async createUser(createUserRequestDto: CreateUserRequestDto) {
    const { email, password, role_id, username } = createUserRequestDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await hash(password, 10);

      const user = transactionalEntityManager.create(User, {
        email,
        password_hash: hashedPassword,
        role: { id: role_id },
        username,
      });

      return await this.dataSource.manager.save(user);
    });
  }

  /**
   * Get the list of all users.
   */
  async getUsers() {
    return await this.dataSource.manager.find(User, {
      select: [
        'id',
        'email',
        'username',
        'created_at',
        'updated_at',
        'deleted_at',
        'role',
      ],
    });
  }

  /**
   * Get details of a specific user.
   * @param userId - UUID of the user.
   */
  async getUserDetails(userId: UUID) {
    return await this.dataSource.manager.findOne(User, {
      where: { id: userId },
      select: [
        'id',
        'email',
        'username',
        'created_at',
        'updated_at',
        'deleted_at',
        'role',
      ],
    });
  }

  /**
   * Update an existing user.
   * @param updateUserRequestDto - Data transfer object for updating a user.
   * @param userId - UUID of the user to update.
   */
  async updateUser(updateUserRequestDto: UpdateUserRequestDto, userId: UUID) {
    const { email, password, role_id, username } = updateUserRequestDto;
    const updateDetails: Partial<User> = {};
    if (email) updateDetails.email = email;
    if (role_id) updateDetails.role = { id: role_id } as Role; //partial Role object
    if (username) updateDetails.username = username;
    if (password) updateDetails.password_hash = await hash(password, 10);

    return await this.dataSource.manager.update(
      User,
      { id: userId },
      updateDetails,
    );
  }

  /**
   * Find user from database by provided email.
   * @param email - Email of user.
   */
  async findUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  /**
   * Create AWS Console credentials for a user.
   * @param transactionalEntityManager - Database transactional manager
   * @param addAwsConsoleCredentialsRequestDto - DTO with AWS Console credential details.
   * @param user - User context passed from the decorator.
   */
  async createAwsConsoleCredentials(
    transactionalEntityManager: EntityManager,
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_password, aws_username, expiration_time } =
      addAwsConsoleCredentialsRequestDto;

    const awsUser = transactionalEntityManager.create(AwsConsoleCredentials, {
      aws_username,
      aws_password,
      expiration_time,
      created_by: { id: user.id },
    });
    return transactionalEntityManager.save(awsUser);
  }

  /**
   * Update AWS Console credentials for a user.
   * @param transactionalEntityManager - Database transactional manager
   * @param updateAwsConsoleCredentialsRequestDto - Data transfer object for updating AWS Console credentials.
   * @param user - User context passed from the decorator.
   */
  async updateAwsConsoleCredentials(
    transactionalEntityManager: EntityManager,
    updateAwsConsoleCredentialsRequestDto: UpdateAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const {
      aws_new_password,
      aws_new_username,
      aws_username,
      expiration_time,
    } = updateAwsConsoleCredentialsRequestDto;

    const updateDetails: Partial<AwsConsoleCredentials> = {};
    if (aws_new_username) updateDetails.aws_username = aws_new_username;
    if (aws_new_password) updateDetails.aws_password = aws_new_password;
    if (expiration_time) updateDetails.expiration_time = expiration_time;

    await transactionalEntityManager.update(
      AwsConsoleCredentials,
      {
        aws_username,
      },
      {
        ...updateDetails,
        updated_by: { id: user.id },
      },
    );
  }

  /**
   * Delete AWS Console credentials for a user.
   * @param transactionalEntityManager - Database transactional manager
   * @param username - Username of user.
   */
  async deleteAwsConsoleCredentials(
    transactionalEntityManager: EntityManager,
    username: string,
  ) {
    return await transactionalEntityManager.delete(AwsConsoleCredentials, {
      aws_username: username,
    });
  }

  /**
   * Create programmatic credentials for AWS services.
   * @param AccessKeyId - AccessKeyId of programmatic user
   * @param SecretAccessKey - SecretAccessKey of programmatic user
   * @param status -  Status of access keys
   * @param expiration_time - Expiration time of temporary generated credentials
   * @param aws_username - AWS username
   * @param user - User context passed from the decorator.
   *
   */
  async createProgrammaticCredentials(
    AccessKeyId: string,
    SecretAccessKey: string,
    status: AwsAccessKeysStatusEnum,
    expiration_time: Date,
    aws_username: string,
    user: UserBasicInfo,
  ) {
    const awsUser = this.dataSource.manager.create(AwsProgrammaticCredentials, {
      aws_access_key: AccessKeyId,
      aws_secret_key: SecretAccessKey,
      expiration_time,
      aws_username,
      status,
      created_by: { id: user.id },
    });
    return this.dataSource.manager.save(awsUser);
  }

  /**
   * Update programmatic credentials for AWS services.
   * @param transactionalEntityManager - Database transactional manager
   * @param updateProgrammaticCredentialsRequestDto - Data transfer object for updating AWS programmatic credentials status.
   * @param user - User context passed from the decorator.
   * @returns
   */
  async updateAwsProgrammaticCredentials(
    transactionalEntityManager: EntityManager,
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, status } = updateProgrammaticCredentialsRequestDto;

    await transactionalEntityManager.update(
      AwsProgrammaticCredentials,
      {
        aws_username,
      },
      { status: status, updated_by: { id: user.id } },
    );
  }

  /**
   * Delete programmatic credentials for AWS services.
   * @param transactionalEntityManager - Database transactional manager
   * @param deleteProgrammaticCredentialsRequestDto - Data transfer object for deleting AWS programmatic credentials status.
   * @returns
   */
  async deleteProgrammaticCredentials(
    transactionalEntityManager: EntityManager,
    username: string,
  ) {
    await transactionalEntityManager.delete(AwsProgrammaticCredentials, {
      aws_username: username,
    });
  }

  async listAwsConsoleCredentials() {
    return await this.dataSource.manager.find(AwsConsoleCredentials);
  }

  async listAwsProgrammaticCredentials() {
    return await this.dataSource.manager.find(AwsProgrammaticCredentials);
  }
}
