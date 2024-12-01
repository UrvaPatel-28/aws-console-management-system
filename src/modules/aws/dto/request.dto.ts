import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { AwsPolicyEffectEnum } from 'src/constants/enum';

export class CreatePolicyRequestDto {
  @IsString()
  @ApiProperty({ example: 'custom-policy' })
  policy_name: string;

  @IsObject()
  @ApiProperty({
    example: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Action: ['s3:*', 'ec2:*'],
          Resource: ['*'],
          Condition: {
            DateLessThan: {
              'aws:CurrentTime': '2024-11-29T09:55:58.641Z',
            },
          },
        },
        {
          Effect: 'Allow',
          Action: 'sts:AssumeRole',
          Resource: 'arn:aws:iam::905418466860:role/custom-role/my-role-2',
        },
      ],
    },
  })
  policy_document: object;
}

export class TagDto {
  @IsString()
  @ApiProperty({ example: 'Environment' })
  Key: string;

  @IsString()
  @ApiProperty({ example: 'Production' })
  Value: string;
}

export class CreateRoleRequestDto {
  @IsString()
  @ApiProperty({ example: 'my-role' })
  role_name: string;

  @IsObject()
  @ApiProperty({
    example: {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: {
            AWS: 'arn:aws:iam::905418466860:root',
          },
          Action: 'sts:AssumeRole',
        },
      ],
    },
  })
  assume_role_policy_document: object;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'My custom role' })
  description: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '/custom-role/' })
  path: string;

  @IsArray()
  @IsOptional()
  @ApiPropertyOptional({ type: [TagDto] })
  tags: TagDto[];
}

export class AssignRoleRequestDto {
  @IsString() userName: string;
  @IsString() roleArn: string;
}

export class AssumeRoleRequestDto {
  @IsString()
  @ApiProperty({
    example: 'arn:aws:iam::905418466860:role/custom-role/my-role-2',
  })
  role_arn: string;

  @IsString()
  @ApiProperty({ example: 'my-session' })
  session_name: string;

  @IsInt()
  @Min(900) // 15 minutes
  @Max(43200) //12 hours
  @IsOptional()
  @ApiProperty({ example: 3600 })
  duration_in_seconds: number;
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

  @ApiProperty({ example: 'Allow' })
  @IsEnum(AwsPolicyEffectEnum)
  effect: AwsPolicyEffectEnum;
}

export class AttachPolicyToUserRequestDto {
  @IsString()
  @ApiProperty({ example: 'user1' })
  username: string;

  @IsString()
  @ApiProperty({ example: 'arn:aws:iam::aws:policy/AmazonS3FullAccess' })
  policy_arn: string;
}

export class AttachPolicyToRoleRequestDto {
  @IsString()
  @ApiProperty({
    example: 'my-role-2',
  })
  role_name: string;

  @IsString()
  @ApiProperty({ example: 'arn:aws:iam::aws:policy/AmazonS3FullAccess' })
  policy_arn: string;
}

export class CreateAccessKeyRequestDto {
  @IsString()
  username: string;
}
