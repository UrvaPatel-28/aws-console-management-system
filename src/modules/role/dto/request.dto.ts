import { IsArray, IsEnum } from 'class-validator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';

export class AddRoleRequestDto {
  @IsEnum(RoleEnum)
  name: RoleEnum;

  @IsEnum(PermissionEnum, { each: true })
  @IsArray()
  permissions: PermissionEnum[];
}
