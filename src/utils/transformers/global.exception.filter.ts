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

/**
 * It is a custom exception filter that handles all exceptions.
 * It logs the exception, stores an audit log table, and returns a standardized error response to the client.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger = new Logger(GlobalExceptionFilter.name),
  ) {}

  async catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); // Extracts the response object
    const request = ctx.getRequest<Request & UserBasicInfo>(); // Extracts the request object, including user info

    // Determine the HTTP status code based on the exception type
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string;

    if (exception instanceof HttpException) {
      // Handle HttpException
      const responseData = exception.getResponse();

      if (typeof responseData === 'string') {
        message = responseData; // If the response is a string, use it directly
      } else if (typeof responseData === 'object' && responseData !== null) {
        // If the response is an object, check if it contains a message field
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

    // Log the error details using a logger
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

    // Send the error response to the client
    response.status(status).json({
      is_error: true,
      status,
      message,
    });
  }
}
