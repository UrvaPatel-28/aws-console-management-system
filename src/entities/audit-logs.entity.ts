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
  user!: User | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  api_endpoint: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  http_method: string | null;

  @Column({ type: 'json', nullable: true })
  request_payload: Record<string, any> | null;

  @Column({ type: 'json', nullable: true })
  response: Record<string, any> | null;

  @Column({ type: 'int', nullable: true })
  response_status: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  response_message: string | null;

  @CreateDateColumn()
  created_at!: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  user_agent: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip_address: string | null;

  @Column({ type: 'float', nullable: true })
  execution_duration: number | null;
}
