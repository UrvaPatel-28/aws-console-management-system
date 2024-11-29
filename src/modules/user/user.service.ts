import { Injectable } from '@nestjs/common';
import { UserQueryBuilder } from './user.query.builder';
import {
  AddAwsConsoleCredentialsRequestDto,
  CreateProgrammaticCredentialsRequestDto,
  CreateUserRequestDto,
} from './dto/request.dto';
import { UserBasicInfo } from 'src/utils/interface/auth.type';

@Injectable()
export class UserService {
  constructor(private readonly userQueryBuilder: UserQueryBuilder) {}
  async createUser(createUserRequestDto: CreateUserRequestDto) {
    return await this.userQueryBuilder.createUser(createUserRequestDto);
  }

  async addUserAwsTemporaryCredentials(
    addAwsConsoleCredentialsRequestDto: AddAwsConsoleCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    return await this.userQueryBuilder.addUserAwsTemporaryCredentials(
      addAwsConsoleCredentialsRequestDto,
      user,
    );
  }

  async createProgrammaticCredentials(
    createProgrammaticCredentialsRequestDto: CreateProgrammaticCredentialsRequestDto,
    user: UserBasicInfo,
  ) {
    return await this.userQueryBuilder.createProgrammaticCredentials(
      createProgrammaticCredentialsRequestDto,
      user,
    );
  }
}
