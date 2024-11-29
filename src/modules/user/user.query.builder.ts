import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateProgrammaticCredentialsRequestDto,
  CreateUserRequestDto,
} from './dto/request.dto';
import { hash } from 'bcrypt';
import { AwsIamService } from '../aws/aws.iam.service';
import { AwsStsService } from '../aws/aws.sts.service';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { UserBasicInfo } from 'src/utils/interface/auth.type';
import { AwsProgrammaticCredentials } from 'src/entities/aws-programmatic-credentials.entity';

@Injectable()
export class UserQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly awsIamService: AwsIamService,
    private readonly awsStsService: AwsStsService,
  ) {}

  async createUser(createUserRequestDto: CreateUserRequestDto) {
    const { email, password, role, team_leader, username } =
      createUserRequestDto;

    return this.dataSource.transaction(async (transactionalEntityManager) => {
      const hashedPassword = await hash(password, 10);

      const user = transactionalEntityManager.create(User, {
        email,
        password_hash: hashedPassword,
        role: { id: role },
        team_leader: { id: team_leader },
        username,
      });

      await this.dataSource.manager.save(user);
    });
  }

  async findUserByEmail(email: string) {
    return this.dataSource.manager.findOne(User, { where: { email } });
  }

  async addUserAwsTemporaryCredentials(
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const {
      aws_password,
      aws_username,
      expiration_time,
      is_password_reset_required,
    } = addAwsConsoleCredentialsRequestDto;

    await this.awsIamService.createUser(aws_username);
    await this.awsIamService.createLoginProfile(
      aws_username,
      aws_password,
      is_password_reset_required,
    );

    const awsUser = this.dataSource.manager.create(AwsConsoleCredentials, {
      aws_username,
      aws_password,
      expiration_time,
      user: { id: user.id },
    });
    return this.dataSource.manager.save(awsUser);
  }

  async createProgrammaticCredentials(
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    const { username, expiration_time } =
      createProgrammaticCredentialsRequestDto;
    const programmaticCredentials =
      await this.awsIamService.createAccessKeys(username);

    const { AccessKeyId, SecretAccessKey } = programmaticCredentials;

    const awsUser = this.dataSource.manager.create(AwsProgrammaticCredentials, {
      aws_access_key: AccessKeyId,
      aws_secret_key: SecretAccessKey,
      expiration_time,
      user: { id: user.id },
    });
    return this.dataSource.manager.save(awsUser);
  }
}
