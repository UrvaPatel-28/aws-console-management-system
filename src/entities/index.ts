import { AwsConsoleCredentials } from './aws-console-credentials.entity';
import { AwsProgrammaticCredentials } from './aws-programmatic-credentials.entity';
import { Base } from './base.entity';
import { Permission } from './permission.entity';
import { Role } from './role.entity';
import { User } from './user.entity';

export const entities = [
  User,
  Base,
  Role,
  Permission,
  AwsConsoleCredentials,
  AwsProgrammaticCredentials,
];
