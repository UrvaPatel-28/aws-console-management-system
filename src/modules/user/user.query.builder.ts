import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateUserRequestDto,
  UpdateAwsConsoleCredentialsRequestDto,
  UpdateProgrammaticCredentialsRequestDto,
} from './dto/request.dto';
import { hash } from 'bcrypt';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AwsProgrammaticCredentials } from 'src/entities/aws-programmatic-credentials.entity';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';

@Injectable()
export class UserQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createUser(createUserRequestDto: CreateUserRequestDto) {
    const { email, password, role, username } = createUserRequestDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await hash(password, 10);

      const user = transactionalEntityManager.create(User, {
        email,
        password_hash: hashedPassword,
        role: { id: role },
        username,
      });

      await this.dataSource.manager.save(user);
    });
  }

  async findUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async createAwsConsoleCredentials(
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_password, aws_username, expiration_time } =
      addAwsConsoleCredentialsRequestDto;

    const awsUser = this.dataSource.manager.create(AwsConsoleCredentials, {
      aws_username,
      aws_password,
      expiration_time,
      created_by: { id: user.id },
    });
    return this.dataSource.manager.save(awsUser);
  }

  async updateAwsConsoleCredentials(
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

    await this.dataSource.manager.update(
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

  async deleteAwsConsoleCredentials(username: string) {
    return await this.dataSource.manager.delete(AwsConsoleCredentials, {
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
    updateProgrammaticCredentialsRequestDto: UpdateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { aws_username, status } = updateProgrammaticCredentialsRequestDto;

    await this.dataSource.manager.update(
      AwsProgrammaticCredentials,
      {
        aws_username,
      },
      { status: status, updated_by: { id: user.id } },
    );
  }

  async deleteProgrammaticCredentials(username: string) {
    await this.dataSource.manager.delete(AwsProgrammaticCredentials, {
      aws_username: username,
    });
  }

  async listAwsConsoleCredentials() {
    return await this.dataSource.manager.find(AwsConsoleCredentials);
  }

  async listAwsProgrammatcCredentials() {
    return await this.dataSource.manager.find(AwsProgrammaticCredentials);
  }
}
