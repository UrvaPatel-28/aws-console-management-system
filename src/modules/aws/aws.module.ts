import { Module } from '@nestjs/common';
import { AwsController } from './aws.controller';
import { AwsService } from './aws.service';
import { AwsQueryBuilder } from './aws.query.builder';
import { AwsIamService } from './aws.iam.service';
import { AwsStsService } from './aws.sts.service';
import { AwsS3Service } from './aws.s3.service';

@Module({
  imports: [],
  controllers: [AwsController],
  providers: [
    AwsService,
    AwsQueryBuilder,
    AwsS3Service,
    AwsIamService,
    AwsStsService,
  ],
  exports: [AwsS3Service, AwsIamService, AwsStsService],
})
export class AwsModule {}
