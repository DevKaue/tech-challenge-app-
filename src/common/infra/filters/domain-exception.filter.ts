import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Inject,
  Injectable,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { EXCEPTION_STATUS_MAP } from '@/common/infra/filters/exception-status.map';
import type { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { ExceptionStatusResolver } from '@/common/infra/filters/exception-status.resolver';
import { ExceptionResponseBuilder } from '@/common/infra/filters/exception-response.builder';
import { logHttpOutcome } from '@/common/infra/logging/http-log';

/**
 * Filter de rota. Recebe o mapa de exceções do bounded context que o registra,
 * de modo que `@common` não conhece nenhuma exceção de domínio.
 *
 * Cada módulo provê o seu mapa sob o token `EXCEPTION_STATUS_MAP`:
 *
 * ```ts
 * providers: [{ provide: EXCEPTION_STATUS_MAP, useValue: customerManagementStatusMap }]
 * ```
 *
 * Filter de rota tem precedência sobre o global, então o registro da
 * requisição precisa acontecer aqui também; senão um 5xx nas rotas de OS
 * nunca chegaria ao log nem ao alerta.
 */
@Catch()
@Injectable()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly statusResolver: ExceptionStatusResolver;
  private readonly responseBuilder = new ExceptionResponseBuilder();

  constructor(@Inject(EXCEPTION_STATUS_MAP) statusMap: ExceptionStatusMap) {
    this.statusResolver = new ExceptionStatusResolver(statusMap);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const statusCode = this.statusResolver.resolve(exception);

    logHttpOutcome(http.getRequest<Request>(), statusCode, exception);

    response
      .status(statusCode)
      .json(this.responseBuilder.build(exception, statusCode));
  }
}
