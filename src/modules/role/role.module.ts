import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { RoleQueryBuilder } from './role.query.builder';

@Module({
  imports: [],
  controllers: [RoleController],
  providers: [RoleService, RoleQueryBuilder],
})
export class RoleModule {}
