import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Base } from './base.entity';
import { Role } from './role.entity';

@Entity()
@Unique('UQ_user_username', ['username'])
@Unique('UQ_user_email', ['email'])
export class User extends Base {
  @PrimaryGeneratedColumn('uuid', { primaryKeyConstraintName: 'PK_user_id' })
  id!: UUID;

  @Column({ type: 'varchar', length: 70, nullable: false })
  username!: string;

  @Column({ type: 'varchar', length: 300, nullable: false })
  password_hash!: string;

  @ManyToOne(() => User, (user) => user.team_members, {
    nullable: true,
  })
  @JoinColumn({
    name: 'team_leader_id',
    foreignKeyConstraintName: 'FK_user_team_leader_id',
  })
  team_leader: User | null;

  @OneToMany(() => User, (user) => user.team_leader)
  team_members: User[];

  @ManyToOne(() => Role, (role) => role.id, { eager: true })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'FK_user_role_id',
  })
  role: Role;

  @Column({ type: 'varchar', length: 200, nullable: false })
  email!: string;
}
