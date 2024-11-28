import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';
import { trimAndFormat } from 'src/utils/common.utils';

export class LoginRequestDto {
  @IsString()
  @Transform(({ value }) => trimAndFormat(value))
  username: string;

  @IsString()
  password: string;
}
