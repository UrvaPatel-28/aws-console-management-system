import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_audit_log_id',
  })
  id: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_audit_log_user_id',
  })
  user!: User;

  @Column({ type: 'varchar', length: 255, nullable: true })
  api_endpoint: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  http_method: string;

  @Column({ type: 'json', nullable: true })
  request_payload: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  response_status: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  response_message: string;

  @CreateDateColumn()
  created_at!: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string;

  @Column({ type: 'float', nullable: true })
  execution_duration: number;
}
