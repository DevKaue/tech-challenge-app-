import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response, Request } from 'express';
import type { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { ExceptionStatusResolver } from '@/common/infra/filters/exception-status.resolver';
import { ExceptionResponseBuilder } from '@/common/infra/filters/exception-response.builder';
import { logHttpOutcome } from '@/common/infra/logging/http-log';

/**
 * Filter global. Usa o mesmo resolver e o mesmo builder do filter de rota — a
 * API responde erro no mesmo formato independentemente de qual filter atende —
 * e registra a requisição (`http.request` e, em 5xx, `http.error`).
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
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

    logHttpOutcome(request, statusCode, exception);

    response
      .status(statusCode)
      .json(this.responseBuilder.build(exception, statusCode));
  }
}
