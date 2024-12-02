import { Injectable } from '@nestjs/common';
import { AuditLogsQueryBuilder } from './audit-logs.query.builder';
import { GetAuditLogsRequestDto } from './dto/request.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsQueryBuilder: AuditLogsQueryBuilder) {}

  async getAuditLogs(getAuditLogsRequestDto: GetAuditLogsRequestDto) {
    return await this.auditLogsQueryBuilder.getAuditLogs(
      getAuditLogsRequestDto,
    );
  }
}
