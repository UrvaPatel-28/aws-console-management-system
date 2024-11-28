import { UUID } from 'crypto';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from './base.entity';
import { User } from './user.entity';

@Entity()
export class AuditLogs extends Base {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_audit_logs_id',
  })
  id!: UUID;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_audit_logs_user_id',
  })
  user!: User;

  @Column({ type: 'varchar', length: 100, nullable: false })
  action!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  resource_type!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  resource_id!: string;

  @CreateDateColumn()
  expiration_time!: Date | null;
}
