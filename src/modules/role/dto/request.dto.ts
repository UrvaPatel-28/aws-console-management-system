import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';

export class AddRoleRequestDto {
  @IsEnum(RoleEnum)
  @ApiProperty({ example: 'TeamLeader' })
  name: RoleEnum;

  @IsEnum(PermissionEnum, { each: true })
  @IsArray()
  @ApiProperty({
    example: [
      'Create Aws Credentials',
      'Update Aws Credentials',
      'View Audit Logs',
      'Manage Role And Permissions',
    ],
  })
  permissions: PermissionEnum[];
}
