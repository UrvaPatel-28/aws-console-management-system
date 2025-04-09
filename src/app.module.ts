import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { entities } from './entities';
import { UserModule } from './modules/user/user.module';
import { migrationFolder } from './utils/database/ormconfig';
import { AwsModule } from './modules/aws/aws.module';
import { RoleModule } from './modules/role/role.module';
import { AuditLogsModule } from './modules/audit-logs/audit.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        entities: entities,
        migrations: [migrationFolder],
        synchronize: true,
        // extra: {
        //   ssl: {
        //     rejectUnauthorized: false,
        //   },
        // },
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    AwsModule,
    RoleModule,
    AuditLogsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CleanupService],
})
export class AppModule {}
