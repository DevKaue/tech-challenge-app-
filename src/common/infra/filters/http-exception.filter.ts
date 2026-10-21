import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import type { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { ExceptionStatusResolver } from '@/common/infra/filters/exception-status.resolver';
import { ExceptionResponseBuilder } from '@/common/infra/filters/exception-response.builder';

/**
 * Filter global. Usa o mesmo resolver e o mesmo builder do filter de rota — a
 * API responde erro no mesmo formato independentemente de qual filter atende —
 * e acrescenta o logging da requisição.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private readonly statusResolver: ExceptionStatusResolver;
  private readonly responseBuilder = new ExceptionResponseBuilder();

  constructor(statusMap: ExceptionStatusMap) {
    this.statusResolver = new ExceptionStatusResolver(statusMap);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode = this.statusResolver.resolve(exception);

    this.log(exception, request, statusCode);

    response
      .status(statusCode)
      .json(this.responseBuilder.build(exception, statusCode));
  }

  private log(exception: unknown, request: Request, statusCode: number): void {
    const route = `${request.method} ${request.url}`;

    if (statusCode < Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.warn(`${route} → ${statusCode}`);
      return;
    }

    const stack =
      exception instanceof Error && exception.stack ? exception.stack : '';

    this.logger.error(`Unhandled exception on ${route}`, stack);
  }
}
