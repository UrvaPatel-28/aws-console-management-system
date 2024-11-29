import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @ApiProperty({ example: 'admin@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'Password@1234' })
  password: string;
}
