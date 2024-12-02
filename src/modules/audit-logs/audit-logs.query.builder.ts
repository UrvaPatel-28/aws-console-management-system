import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetAuditLogsRequestDto } from './dto/request.dto';
import { AuditLog } from 'src/entities/audit-logs.entity';
import { OrderByEnum } from 'src/constants/enum';

@Injectable()
export class AuditLogsQueryBuilder {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getAuditLogs(getAuditLogsRequestDto: GetAuditLogsRequestDto) {
    const {
      api_endpoint,
      current_page,
      date_from,
      date_to,
      execution_duration_in_ms,
      http_method,
      ip_address,
      record_per_page,
      response_message,
      response_status,
      user_id,
      sort_by,
      order_by,
    } = getAuditLogsRequestDto;
    const query = this.dataSource.manager.createQueryBuilder(
      AuditLog,
      'audit_log',
    );

    if (user_id) {
      query.andWhere('audit_log.user_id = :user_id', { user_id });
    }
    if (api_endpoint) {
      query.andWhere('audit_log.api_endpoint ILIKE :api_endpoint', {
        api_endpoint: `%${api_endpoint}%`,
      });
    }
    if (response_message) {
      query.andWhere('audit_log.response_message ILIKE :response_message', {
        response_message: `%${response_message}%`,
      });
    }
    if (http_method) {
      query.andWhere('audit_log.http_method = :http_method', { http_method });
    }
    if (response_status) {
      query.andWhere('audit_log.response_status = :response_status', {
        response_status,
      });
    }
    if (ip_address) {
      query.andWhere('audit_log.ip_address LIKE :ip_address', {
        ip_address: `%${ip_address}%`,
      });
    }
    if (date_from) {
      query.andWhere('audit_log.created_at >= :date_from', { date_from });
    }
    if (date_to) {
      query.andWhere('audit_log.created_at <= :date_to', { date_to });
    }
    if (execution_duration_in_ms) {
      query.andWhere(
        'audit_log.execution_duration <= :execution_duration_in_ms',
        {
          execution_duration_in_ms,
        },
      );
    }

    switch (order_by) {
      case OrderByEnum.ApiEndpoint:
        query.addOrderBy('audit_log.api_endpoint', sort_by);
        break;
      case OrderByEnum.ExecutionDurationInMs:
        query.addOrderBy('audit_log.execution_duration', sort_by);
        break;
      case OrderByEnum.HttpMethod:
        query.addOrderBy('audit_log.http_method', sort_by);
        break;
      case OrderByEnum.ResponseMessage:
        query.addOrderBy('audit_log.response_message', sort_by);
        break;
      case OrderByEnum.ResponsesStatus:
        query.addOrderBy('audit_log.response_status', sort_by);
        break;
      default:
        query.addOrderBy('audit_log.created_at', 'DESC');
        break;
    }

    const skip = (current_page - 1) * record_per_page;
    query.skip(skip).take(record_per_page);

    const [data, total] = await query.getManyAndCount();

    return {
      total,
      current_page,
      record_per_page,
      totalPages: Math.ceil(total / record_per_page),
      data,
    };
  }
}
