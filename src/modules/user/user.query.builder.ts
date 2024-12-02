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

  async findUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

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

  async deleteAwsConsoleCredentials(
    transactionalEntityManager: EntityManager,
    username: string,
  ) {
    return await transactionalEntityManager.delete(AwsConsoleCredentials, {
      aws_username: username,
    });
  }

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
