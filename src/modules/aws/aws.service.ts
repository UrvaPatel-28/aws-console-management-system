import { Injectable } from '@nestjs/common';
import { AwsQueryBuilder } from './aws.query.builder';

@Injectable()
export class AwsService {
  constructor(private readonly awsQueryBuilder: AwsQueryBuilder) {}
}
