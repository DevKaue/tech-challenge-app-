import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpResponse } from '@/common/application/contracts/http';

function isHttpResponse(value: unknown): value is HttpResponse<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'statusCode' in value &&
    'body' in value &&
    typeof (value as { statusCode: unknown }).statusCode === 'number'
  );
}

/**
 * Aplica na resposta o `statusCode` devolvido pelos controllers de apresentação
 * e desembrulha o `body`.
 *
 * Sem isto, cada rota precisa injetar `@Res({ passthrough: true })` e repetir
 * `res.status(...)` / `return httpResponse.body` — o bloco que se repetia em
 * todos os métodos dos controllers de infra.
 */
@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Sendo global, o interceptor veria também execuções não-HTTP (mensageria,
    // por exemplo), onde não há resposta para receber status.
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((value: unknown) => {
        if (!isHttpResponse(value)) {
          return value;
        }

        response.status(value.statusCode);

        return value.body;
      }),
    );
  }
}
