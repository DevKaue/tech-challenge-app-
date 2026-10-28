import { HttpStatus, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { currentRequestContext, elapsedMs } from './request-context';

const logger = new Logger('HTTP');

/**
 * Rota como registrada (`/api/service-orders/:id`), nunca a URL com ids: com
 * a URL crua, cada OS viraria uma série nova nos gráficos por rota.
 */
export function routeTemplate(request: Request): string {
  const path = (request.route as { path?: unknown } | undefined)?.path;
  return typeof path === 'string' ? path : '(sem rota)';
}

/**
 * Um evento `http.request` por resposta (sucesso no interceptor, erro nos
 * filters) e, para 5xx, também um `http.error` com o nome da exceção. É deles
 * que saem a latência por rota, a taxa de erro e o alerta de falha no
 * processamento de OS do New Relic.
 */
export function logHttpOutcome(
  request: Request,
  statusCode: number,
  exception?: unknown,
): void {
  const fields = {
    method: request.method,
    route: routeTemplate(request),
    statusCode,
    durationMs: elapsedMs(currentRequestContext()),
  };

  if (statusCode >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
    logger.warn({ event: 'http.request', ...fields });
    const stack =
      exception instanceof Error && exception.stack
        ? exception.stack
        : undefined;
    logger.error(
      {
        event: 'http.error',
        ...fields,
        errorName: errorName(exception),
      },
      stack,
    );
    return;
  }

  if (statusCode >= Number(HttpStatus.BAD_REQUEST)) {
    logger.warn({ event: 'http.request', ...fields });
    return;
  }

  logger.log({ event: 'http.request', ...fields });
}

function errorName(exception: unknown): string {
  if (exception instanceof Error) return exception.constructor.name;
  return typeof exception;
}
