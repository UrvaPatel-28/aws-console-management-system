import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './utils/guards/jwt-auth.guard';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PermissionGuard } from './utils/guards/permission.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.enableCors({
    credentials: true,
    // origin: ['http://localhost:3000'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  app.useGlobalGuards(new PermissionGuard(reflector));

  const documentBuilder = new DocumentBuilder()
    .setTitle('AWS Credentials Management System')
    .setVersion('1.0')
    .addBearerAuth();

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  SwaggerModule.setup('swagger', app, document);

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
void bootstrap();
