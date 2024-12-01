import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Permission } from './permission.entity';
import { RoleEnum } from 'src/constants/enum';

@Entity()
@Unique('UQ_role_name', ['name'])
export class Role {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_role_id' })
  id!: UUID;

  @Column({
    type: 'enum',
    enum: RoleEnum,
    enumName: 'role_enum',
    nullable: false,
  })
  name!: RoleEnum;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: true,
    eager: true,
  })
  @JoinTable({
    name: 'role_permission_link',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permission_link_role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permission_link_permission_id',
    },
  })
  permissions: Permission[];
}
