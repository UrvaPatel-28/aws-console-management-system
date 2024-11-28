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
export class AwsProgrammaticCredentials extends Base {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_aws_programmatic_credentials_id',
  })
  id!: UUID;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_aws_programmatic_credentials_user_id',
  })
  user!: User;

  @Column({ type: 'varchar', length: 50, nullable: false })
  aws_access_key!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  aws_secret_key!: string;

  @CreateDateColumn()
  expiration_time!: Date | null;
}
