import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { logHttpOutcome } from '@common/infra/logging/http-log';

/**
 * Registra as respostas de sucesso. As de erro não passam pelo `tap` (o
 * Observable termina em erro) e são registradas pelos exception filters, com
 * o mesmo formato.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();

    return next.handle().pipe(
      tap(() => {
        logHttpOutcome(request, http.getResponse<Response>().statusCode);
      }),
    );
  }
}
