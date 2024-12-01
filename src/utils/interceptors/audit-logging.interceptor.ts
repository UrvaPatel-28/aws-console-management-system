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

@Injectable()
export class AuditLoggingInterceptor implements NestInterceptor {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest();
    const ipAddress = request.ip;

    return next.handle().pipe(
      map(async (response) => {
        // Successful response
        const auditLog = this.dataSource.manager.create(AuditLog, {
          user: request.user ?? null,
          api_endpoint: request.url,
          http_method: request.method,
          request_payload: request.body,
          response_status: 200,
          response_message: 'Success',
          ip_address: ipAddress,
          execution_duration: Date.now() - now,
        });
        await this.dataSource.manager.save(auditLog);
        return response;
      }),
    );
  }
}
