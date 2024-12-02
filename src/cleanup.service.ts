import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, LessThan } from 'typeorm';
import { AwsConsoleCredentials } from 'src/entities/aws-console-credentials.entity';
import { UserService } from './modules/user/user.service';

@Injectable()
export class CleanupService {
  constructor(
    private readonly userService: UserService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}
  @Cron('0 */2 * * * *') // Executes once at the start of every 2 minutes
  async deleteExpiredCredentials() {
    const currentTime = new Date();
    try {
      const awsConsoleCredentials = await this.dataSource.manager.find(
        AwsConsoleCredentials,
        { where: { expiration_time: LessThan(currentTime) } },
      );

      for (const record of awsConsoleCredentials) {
        await this.userService.deleteAwsConsoleCredentials({
          aws_username: record.aws_username,
        });
      }
    } catch (error) {
      throw error;
    }
  }
}
