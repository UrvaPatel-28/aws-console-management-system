import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { AuditLog } from 'src/entities/audit-logs.entity';
import { DataSource } from 'typeorm';
import { UserBasicInfo } from '../interface/auth.type';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger = new Logger(AllExceptionsFilter.name),
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & UserBasicInfo>();
    console.log('exception', exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    if (exception instanceof HttpException) {
      // Handle HttpException
      const responseData = exception.getResponse();

      if (typeof responseData === 'string') {
        message = responseData; // Direct string response
      } else if (typeof responseData === 'object' && responseData !== null) {
        // Check if 'message' exists in the responseData object
        if ('message' in responseData) {
          const responseMessage = (
            responseData as { message: string | string[] }
          ).message;
          if (Array.isArray(responseMessage)) {
            message = responseMessage[0]; // Get the first message if it is an array
          } else {
            message = responseMessage; // If it is a string, use it directly
          }
        }
      }
    } else {
      message = 'Internal Server Error'; // For any unknown exception type, return a generic message
    }

    this.logger.error({
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      method: request.method,
      status,
      message: message,
    });

    //Log the error in the AuditLog table
    const auditLog = this.dataSource.manager.create(AuditLog, {
      user: request.user ?? null,
      api_endpoint: request.originalUrl,
      http_method: request.method,
      request_payload: request.body,
      user_agent: request.headers['user-agent'],
      response_status: status,
      response_message: message,
      ip_address: request.ip,
    });
    await this.dataSource.manager.save(AuditLog, auditLog);

    response.status(status).json({
      is_error: true,
      status,
      message,
    });
  }
}
