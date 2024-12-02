import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { GetAuditLogsRequestDto } from './dto/request.dto';
import { AllowUnauthorized } from 'src/utils/decorators/allow-unauthorized.decorator';

@Controller('audit')
@ApiBearerAuth()
@ApiTags('Audit')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @AllowUnauthorized()
  @Get()
  async getAuditLogs(@Query() getAuditLogsRequestDto: GetAuditLogsRequestDto) {
    const data = await this.auditLogsService.getAuditLogs(
      getAuditLogsRequestDto,
    );
    return {
      data,
    };
  }
}
