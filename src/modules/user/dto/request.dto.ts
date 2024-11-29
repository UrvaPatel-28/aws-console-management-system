import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';
import { trimAndFormat } from 'src/utils/common.utils';

export class CreateUserRequestDto {
  @IsString()
  @Transform(({ value }) => trimAndFormat(value))
  username: string;

  @IsString()
  password: string;

  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsUUID()
  @IsOptional()
  team_leader: UUID | null;

  @IsUUID()
  role: UUID;
}

export class AddAwsConsoleCredentialsRequestDto {
  @IsString()
  aws_username: string;

  @IsString()
  aws_password: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiration_time: Date;

  @IsBoolean()
  is_password_reset_required: boolean;
}

export class CreateProgrammaticCredentialsRequestDto {
  @IsString()
  username: string;

  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : value))
  expiration_time: Date;
}
