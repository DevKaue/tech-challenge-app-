import 'dotenv/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ClassSerializerInterceptor,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '@common/infra/filters/http-exception.filter';
import { LoggingInterceptor } from '@common/infra/interceptors/logging.interceptor';
import { allExceptionStatusMaps } from './exception-status.registry';

/**
 * Swagger é ligado por padrão fora de produção e desligado por padrão em
 * produção. `SWAGGER_ENABLED` sobrepõe os dois lados.
 */
function isSwaggerEnabled(): boolean {
  const flag = process.env.SWAGGER_ENABLED;

  if (flag !== undefined) {
    return flag === 'true';
  }

  return process.env.NODE_ENV !== 'production';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
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

  // O Swagger descreve toda a superfície da API, incluindo rotas de escrita.
  // Atrás de um ALB público isso é reconhecimento gratuito para um atacante,
  // então em produção ele fica desligado por padrão. SWAGGER_ENABLED=true
  // reabre explicitamente (útil em staging).
  if (isSwaggerEnabled()) {
    const config = new DocumentBuilder()
      .setTitle('Auto Repair Shop API')
      .setDescription('Tech Challenge — Service Order Management System')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  } else {
    Logger.log('Swagger desabilitado (SWAGGER_ENABLED)', 'Bootstrap');
  }

  // Necessário para que PrismaService.onModuleDestroy() ($disconnect) dispare
  // no SIGTERM enviado pelo Kubernetes ao encerrar o pod.
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  Logger.log(`Application running on http://localhost:${port}`, 'Bootstrap');
  await app.listen(port);
}
bootstrap().catch((err) => {
  Logger.error(err, 'Bootstrap');
  process.exit(1);
});
