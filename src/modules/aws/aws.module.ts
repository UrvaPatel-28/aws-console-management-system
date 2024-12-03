import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsQueryBuilder } from './aws.query.builder';
import { AwsIamService } from './aws.iam.service';
import { AwsStsService } from './aws.sts.service';

@Module({
  imports: [],
  controllers: [AwsController],
  providers: [AwsQueryBuilder, AwsIamService, AwsStsService],
  exports: [AwsIamService, AwsStsService],
})
export class AwsModule {}
