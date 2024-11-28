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
export class AwsConsoleCredentials extends Base {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_aws_console_credentials_id',
  })
  id!: UUID;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_aws_console_credentials_user_id',
  })
  user!: User;

  @Column({ type: 'varchar', length: 50, nullable: false })
  aws_username!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  aws_password!: string;

  @CreateDateColumn()
  expiration_time!: Date | null;
}
