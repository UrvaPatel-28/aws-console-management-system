import { Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';

@Injectable()
export class AwsS3Service {
  constructor(private readonly awsQueryBuilder: AwsQueryBuilder) {}
}
