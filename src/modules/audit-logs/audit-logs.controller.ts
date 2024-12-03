import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { GetAuditLogsRequestDto } from './dto/request.dto';
import {
  PermissionsNeeded,
  RolesNeeded,
} from 'src/utils/decorators/permissions.decorator';
import { PermissionEnum, RoleEnum } from 'src/constants/enum';

/**
 * Controller for managing and retrieving audit logs.
 * This controller exposes an endpoint to query audit logs with filters.
 */
@Controller('audit')
@ApiBearerAuth() // Add bearer token authentication in Swagger documentation.
@ApiTags('Audit') // Groups the endpoints under the "Audit" tag in Swagger documentation.
@RolesNeeded(RoleEnum.Admin, RoleEnum.Auditor) // Sets common roles required for all APIs of this this controller. (In this Admin and Auditor)
@PermissionsNeeded(PermissionEnum.ViewAuditLogs) // Sets common permissions required for all APIs of this this controller.
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  /**
   * Endpoint to retrieve audit logs based on filters and sorting with pagination
   * @param getAuditLogsRequestDto - The query parameters used to filter and sort the audit logs.
   * @returns Audit logs from database.
   */
  @Get()
  @RolesNeeded()
  @PermissionsNeeded()
  async getAuditLogs(@Query() getAuditLogsRequestDto: GetAuditLogsRequestDto) {
    const data = await this.auditLogsService.getAuditLogs(
      getAuditLogsRequestDto,
    );
    return {
      data,
    };
  }
}
