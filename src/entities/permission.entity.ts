import { UUID } from 'crypto';
import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';
import { PermissionEnum } from 'src/constants/enum';

@Entity()
@Unique('UQ_permission_name', ['name'])
export class Permission {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_permission_id',
  })
  id!: UUID;

  @Column({
    type: 'enum',
    enumName: 'permission_enum',
    enum: PermissionEnum,
    nullable: false,
  })
  name!: PermissionEnum;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
