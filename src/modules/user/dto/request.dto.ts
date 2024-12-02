import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';

export class CreateUserRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({ example: 'user1' })
  username: string;

  @IsStrongPassword()
  @ApiProperty({ example: 'Password@1234' })
  password: string;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  @ApiProperty({ example: 'user@gmail.com' })
  email: string;

  @IsUUID()
  @ApiProperty({ example: '0be34b3d-7240-4988-8c5a-24a63c656e40' })
  role_id: UUID;
}

export class UpdateUserRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsOptional()
  @ApiPropertyOptional({ example: 'user1' })
  username: string;

  @IsStrongPassword()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Password@1234' })
  password: string;

  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @IsOptional()
  @ApiPropertyOptional({ example: 'user@gmail.com' })
  email: string;

  @IsUUID()
  @ApiPropertyOptional({ example: '0be34b3d-7240-4988-8c5a-24a63c656e40' })
  @IsOptional()
  role_id: UUID;
}

export class AddAwsConsoleCredentialsRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  @ApiProperty({ example: 'user1' })
  aws_username: string;

  @IsStrongPassword({ minLength: 8 })
  @ApiProperty({ example: 'Password@1234' })
  aws_password: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiration_time: Date;

  @IsBoolean()
  @ApiProperty({ example: false })
  is_password_reset_required: boolean;
}

export class UpdateAwsConsoleCredentialsRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  aws_username: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value.trim().toLowerCase())
  aws_new_username: string;

  @IsString()
  @IsOptional()
  aws_new_password: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiration_time: Date;
}

export class DeleteAwsConsoleCredentialsRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  aws_username: string;
}

export class CreateProgrammaticCredentialsRequestDto {
  @IsString()
  aws_username: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiration_time: Date;
}

export class UpdateProgrammaticCredentialsRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  aws_username: string;

  @IsEnum(AwsAccessKeysStatusEnum)
  status: AwsAccessKeysStatusEnum;
}

export class DeleteProgrammaticCredentialsRequestDto {
  @IsString()
  @Transform(({ value }) => value.trim().toLowerCase())
  aws_username: string;
}
