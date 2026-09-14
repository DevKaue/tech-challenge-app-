import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { HttpExceptionFilter } from '@/common/infra/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/infra/interceptors/logging.interceptor';
import { allExceptionStatusMaps } from '@/exception-status.registry';
import { truncateAll } from './db-cleaner';

export interface TestApp {
  app: INestApplication;
  prisma: PrismaService;
}

export async function createTestApp(): Promise<TestApp> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['error', 'warn'],
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
    new LoggingInterceptor(),
  );

  app.useGlobalFilters(new HttpExceptionFilter(allExceptionStatusMaps));
  app.setGlobalPrefix('api');

  await app.init();

  const prisma = app.get(PrismaService);
  await truncateAll(prisma);

  return { app, prisma };
}

export async function closeTestApp(testApp: TestApp): Promise<void> {
  await testApp.app.close();
}
