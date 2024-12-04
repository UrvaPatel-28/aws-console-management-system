import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { UserService } from './modules/user/user.service';

/**
 * It is responsible for periodically cleaning up expired AWS Console credentials.
 */
@Injectable()
export class CleanupService {
  constructor(
    private readonly userService: UserService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_10AM) // Executes Every day at 10 AM
  async deleteExpiredCredentials() {
    const currentTime = new Date();
    try {
      // Finds all AWS Console credentials with an expiration time less than the current time.
      const awsConsoleCredentials = await this.dataSource.manager.find(
        AwsConsoleCredentials,
        { where: { expiration_time: LessThan(currentTime) } },
      );

      for (const record of awsConsoleCredentials) {
        await this.userService.deleteAwsConsoleCredentials({
          aws_username: record.aws_username, // Deletes credentials associated with the expired AWS username.
        });
      }
    } catch (error) {
      // Catches and rethrows any errors that occur during the process.
      throw error;
    }
  }
}
