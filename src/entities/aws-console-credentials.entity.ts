import { UUID } from 'crypto';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from './base.entity';
import { User } from './user.entity';

@Entity()
@Index('UQ_aws_console_credentials_aws_username', ['aws_username'], {
  unique: true,
})
export class AwsConsoleCredentials extends Base {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_aws_console_credentials_id',
  })
  id!: UUID;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'FK_aws_console_credentials_created_by',
  })
  created_by!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'FK_aws_console_credentials_updated_by',
  })
  updated_by!: User | null;

  @Column({ type: 'varchar', length: 50, nullable: false })
  aws_username!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  aws_password!: string;

  @Column({ type: 'timestamp without time zone' })
  expiration_time!: Date | null;
}
