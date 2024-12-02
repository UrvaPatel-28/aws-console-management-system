import { Module } from '@nestjs/common';

import { AuditLogsController } from './audit-logs.controller';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsQueryBuilder } from './audit-logs.query.builder';

@Module({
  imports: [],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogsQueryBuilder],
})
export class AuditLogsModule {}
