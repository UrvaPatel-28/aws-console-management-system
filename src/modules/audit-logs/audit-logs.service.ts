import { Injectable } from '@nestjs/common';
import { AuditLogsQueryBuilder } from './audit-logs.query.builder';
import { GetAuditLogsRequestDto } from './dto/request.dto';

@Injectable()
export class AuditLogsService {
  constructor(private readonly auditLogsQueryBuilder: AuditLogsQueryBuilder) {}

  /**
   * Endpoint to retrieve audit logs based on filters and sorting with pagination
   * @param getAuditLogsRequestDto - The query parameters used to filter and sort the audit logs.
   * @returns Audit logs from database.
   */
  async getAuditLogs(getAuditLogsRequestDto: GetAuditLogsRequestDto) {
    return await this.auditLogsQueryBuilder.getAuditLogs(
      getAuditLogsRequestDto,
    );
  }
}
