import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './utils/guards/jwt-auth.guard';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from './utils/guards/permission.guard';
import { DataSource } from 'typeorm';
import { GlobalExceptionFilter } from './utils/transformers/global.exception.filter';
import { GlobalInterceptor } from './utils/transformers/global.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);
  const dataSource = app.get(DataSource);

  // Enable CORS
  app.enableCors({
    credentials: true,
    // origin: ['http://localhost:3000'],
  });

  // Global pipes for validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // Global guards for JWT and permission handling
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new PermissionGuard(reflector));

  // Global interceptors for exception handling and response transformation
  app.useGlobalInterceptors(new GlobalInterceptor(dataSource));
  app.useGlobalFilters(new GlobalExceptionFilter(dataSource));

  // Swagger setup with description for each tag
  const documentBuilder = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API documentation for managing AWS credentials')
    .setVersion('1.0')
    .addTag(
      'Authentication',
      'This controller includes API endpoints related to user authentication.',
    )
    .addTag(
      'Role',
      'This controller include APIs related to role management, ex. creating and listing roles along with their associated permissions. All APIs in this controller are protected by role-based access control (RBAC), where role and permissions defined through decorators to ensure restricted access.',
    )
    .addTag(
      'User',
      'This tag covers all user management APIs, including the creation, update, and listing of database users. It also handles managing AWS console users and programmatic access keys. All APIs in this controller are protected by role-based access control (RBAC), where role and permissions defined through decorators to ensure restricted access.',
    )
    .addTag(
      'Aws',
      'This controller includes AWS-related API functionalities. Some of these APIs are also invoked indirectly within the User controller to manage AWS credentials. This tag is meant to handle low-level AWS operations that are used in various parts of the system.',
    )
    .addTag(
      'Audit',
      'This controller include API that get audit logs from the database with filtering, sorting, and pagination.',
    )
    .addBearerAuth();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  // Setup Swagger UI at the /swagger endpoint
  SwaggerModule.setup('swagger', app, document);

  // Get the port from the config and start the application
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  Logger.log(`Application is running on port ${port}`);
}
void bootstrap();
