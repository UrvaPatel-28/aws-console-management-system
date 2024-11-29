import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserQueryBuilder } from './user.query.builder';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [AwsModule],
  controllers: [UserController],
  providers: [UserService, UserQueryBuilder],
})
export class UserModule {}
