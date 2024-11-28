import { Injectable } from '@nestjs/common';
import { UserQueryBuilder } from './user.query.builder';
import { CreateUserRequestDto } from './dto/request.dto';

@Injectable()
export class UserService {
  constructor(private readonly userQueryBuilder: UserQueryBuilder) {}
  async createUser(createUserRequestDto: CreateUserRequestDto) {
    return await this.userQueryBuilder.createUser(createUserRequestDto);
  }
}
