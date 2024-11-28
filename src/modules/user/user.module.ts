import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserQueryBuilder } from './user.query.builder';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, UserQueryBuilder],
})
export class UserModule {}
