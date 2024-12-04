import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuditLog } from 'src/entities/audit-logs.entity';
import { Request, Response } from 'express';

/**
 * GlobalInterceptor is a custom interceptor that logs API requests and responses,
 * including execution time and relevant information, into the AuditLog entity.
 */
@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource, // Injects the TypeORM DataSource for database operations (for audit logging)
  ) {}

  /**
   * Intercepts the incoming HTTP request and outgoing response, logging details into the audit log.
   *
   * @param context - The execution context containing request and response data.
   * @param next - The handler that is called to continue the request processing.
   * @returns Observable<any> - The response data after logging.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const queryResponse = context.switchToHttp().getResponse<Response>();

    const ipAddress = request.ip; // Extracts the client’s IP address from the request

    return next.handle().pipe(
      map(async (response) => {
        // Logs the successful response
        const auditLog = this.dataSource.manager.create(AuditLog, {
          user: request.user ?? null,
          api_endpoint: request.url,
          http_method: request.method,
          request_payload: request.body,
          response_status: queryResponse?.statusCode,
          response_message: response?.message ?? 'Success',
          user_agent: request.headers['user-agent'],
          ip_address: ipAddress,
          response: response,
          execution_duration: Date.now() - now, // The time taken to process the request in milliseconds
        });

        // Saves the audit log to the database
        await this.dataSource.manager.save(auditLog);

        // Returns the response in a structured format
        return {
          is_error: false,
          message: response?.message || '',
          data: response?.data || {},
        };
      }),
    );
  }
}
