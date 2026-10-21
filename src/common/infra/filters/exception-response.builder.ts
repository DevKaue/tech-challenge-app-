import { HttpException, HttpStatus } from '@nestjs/common';

export interface ErrorResponseBody {
  error: string;
  error_code?: string;
  message: unknown;
}

const REASON_PHRASES: Readonly<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'Bad Request',
  [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
  [HttpStatus.FORBIDDEN]: 'Forbidden',
  [HttpStatus.NOT_FOUND]: 'Not Found',
  [HttpStatus.CONFLICT]: 'Conflict',
  [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
};

/**
 * Monta o corpo de erro da API. É a única fonte do formato de resposta de erro,
 * usada tanto pelo filter de rota quanto pelo filter global, para que a API não
 * devolva formatos diferentes conforme a rota.
 */
export class ExceptionResponseBuilder {
  build(exception: unknown, statusCode: number): ErrorResponseBody {
    const errorCode = ExceptionResponseBuilder.extractErrorCode(exception);

    return {
      error: ExceptionResponseBuilder.resolveTitle(exception, statusCode),
      ...(errorCode ? { error_code: errorCode } : {}),
      message: ExceptionResponseBuilder.resolveMessage(exception),
    };
  }

  /**
   * Deriva o título do nome da classe: `CustomerNotFoundException` vira
   * `Customer Not Found`. Substitui a cadeia de if/else que existia antes, e
   * uma exceção nova passa a ter título correto sem nenhuma alteração aqui.
   *
   * A exceção base genérica de cada contexto (`DomainException`) não produz um
   * título informativo, então cai no reason phrase do próprio status.
   */
  private static resolveTitle(exception: unknown, statusCode: number): string {
    const fallback =
      REASON_PHRASES[statusCode] ??
      REASON_PHRASES[HttpStatus.INTERNAL_SERVER_ERROR];

    if (!(exception instanceof Error) || exception instanceof HttpException) {
      return fallback;
    }

    const stripped = exception.name.replace(/Exception$/, '');

    if (stripped === '' || stripped === 'Domain' || stripped === 'Error') {
      return fallback;
    }

    return stripped.replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ');
  }

  private static extractErrorCode(exception: unknown): string | undefined {
    if (!(exception instanceof Error)) {
      return undefined;
    }

    const { errorCode } = exception as Error & { errorCode?: unknown };

    return typeof errorCode === 'string' ? errorCode : undefined;
  }

  private static resolveMessage(exception: unknown): unknown {
    if (exception instanceof HttpException) {
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        return payload;
      }

      if (
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload
      ) {
        return payload.message;
      }

      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Unexpected non-error exception';
  }
}
