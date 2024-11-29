import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AwsPolicyEffectEnum } from 'src/constants/enum';

export class CreatePolicyRequestDto {
  @IsString()
  policy_name: string;

  @IsObject()
  policy_document: object;
}

export class CreateRoleRequestDto {
  @IsString()
  role_name: string;
  @IsObject()
  assume_role_policy_document: object;
}

export class AssignRoleRequestDto {
  @IsString() userName: string;
  @IsString() roleArn: string;
}

export class AssumeRoleRequestDto {
  @IsString() role_arn: string;
  @IsString() session_name: string;
}

export class CreateAwsUserRequestDto {
  @IsString() user_name: string;
}

export class UpdateCredentialRequestDto {
  @IsString()
  username: string;

  @IsString()
  newPassword: string;
  @IsBoolean()
  is_password_reset: boolean;
}

export class CreateLoginProfileRequestDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsBoolean()
  is_password_reset_required: boolean;
}

export class GeneratePolicyRequestDto {
  @ApiProperty({ example: ['s3:*', 'ec2:*'] })
  @IsArray()
  @IsString({ each: true })
  actions: string[];

  @ApiProperty({ example: ['*'] })
  @IsArray()
  @IsString({ each: true })
  resources: string[];

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Conditions for the policy.',
    example: { DateLessThan: { 'aws:CurrentTime': '2024-11-29T15:00:00Z' } },
    required: false,
  })
  conditions?: object;

  @ApiProperty({ example: 'custom-policy' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Allow' })
  @IsEnum(AwsPolicyEffectEnum)
  effect: AwsPolicyEffectEnum;
}

export class AssignPolicyToUserRequestDto {
  @IsString()
  username: string;

  @IsString()
  policy_arn: string;
}

export class AssignPolicyToRoleRequestDto {
  @IsString()
  role_name: string;

  @IsString()
  policy_arn: string;
}

export class CreateAccessKeyRequestDto {
  @IsString()
  username: string;
}
