import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from 'src/utils/passport-strategies/local.strategy';
import { JwtStrategy } from 'src/utils/passport-strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserQueryBuilder } from '../user/user.query.builder';
import { AwsModule } from '../aws/aws.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
    AwsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, UserQueryBuilder],
})
export class AuthModule {}
