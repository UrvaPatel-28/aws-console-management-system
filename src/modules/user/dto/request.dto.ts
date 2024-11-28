import { IsOptional, IsString, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

export class CreateUserRequestDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  email: string;

  @IsUUID()
  @IsOptional()
  team_leader: UUID | null;

  @IsUUID()
  role: UUID;
}
