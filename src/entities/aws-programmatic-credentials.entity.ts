import { UUID } from 'crypto';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Base } from './base.entity';
import { User } from './user.entity';
import { AwsAccessKeysStatusEnum } from 'src/constants/enum';

@Entity()
export class AwsProgrammaticCredentials extends Base {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'PK_aws_programmatic_credentials_id',
  })
  id!: UUID;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({
    name: 'created_by',
    foreignKeyConstraintName: 'FK_aws_programmatic_credentials_created_by',
  })
  created_by!: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({
    name: 'updated_by',
    foreignKeyConstraintName: 'FK_aws_programmatic_credentials_updated_by',
  })
  updated_by!: User | null;

  @Column({ type: 'varchar', length: 50, nullable: false })
  aws_username!: string;

  @Column({ type: 'varchar', length: 50, nullable: false })
  aws_access_key!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  aws_secret_key!: string;

  @Column({
    type: 'enum',
    enum: AwsAccessKeysStatusEnum,
    enumName: 'aws_access_keys_status_enum',
    nullable: false,
  })
  status!: AwsAccessKeysStatusEnum;
}
