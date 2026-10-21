import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ExceptionClass,
  ExceptionStatusMap,
} from '@/common/infra/filters/exception-status.map';

/**
 * Resolve o status HTTP de uma exceção consultando os mapas publicados pelos
 * bounded contexts. Não conhece nenhuma exceção de domínio especificamente.
 */
export class ExceptionStatusResolver {
  constructor(private readonly statusMap: ExceptionStatusMap) {}

  resolve(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (!(exception instanceof Error)) {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }

    let match: ExceptionClass | null = null;
    let matchedStatus = HttpStatus.INTERNAL_SERVER_ERROR;

    for (const [ExceptionType, statusCode] of this.statusMap) {
      if (!(exception instanceof ExceptionType)) {
        continue;
      }

      // Uma exceção casa também com as suas superclasses (por exemplo,
      // CustomerAlreadyExistsException herda de DomainException). Fica a
      // entrada mais específica, para que o resultado não dependa da ordem em
      // que cada contexto escreveu o seu mapa.
      if (match === null || ExceptionType.prototype instanceof match) {
        match = ExceptionType;
        matchedStatus = statusCode;
      }
    }

    return matchedStatus;
  }
}
