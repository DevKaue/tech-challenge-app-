/**
 * Contrato que cada bounded context usa para publicar o mapeamento das suas
 * exceções para status HTTP.
 *
 * O mapeamento vive em `infra` de cada contexto — nunca no domínio, que não
 * deve conhecer HTTP — e é resolvido por `instanceof`, não pelo nome da classe.
 * Assim, adicionar uma exceção nova não exige tocar em `@common`.
 */
export type ExceptionClass = abstract new (...args: never[]) => Error;

export type ExceptionStatusEntry = readonly [ExceptionClass, number];

export type ExceptionStatusMap = ReadonlyArray<ExceptionStatusEntry>;

/**
 * Token de injeção do mapa. Necessário porque `ExceptionStatusMap` é um tipo:
 * não sobrevive à compilação e o Nest não teria o que injetar ao instanciar o
 * filter declarado em `@UseFilters(DomainExceptionFilter)`.
 *
 * Cada módulo provê o seu: `{ provide: EXCEPTION_STATUS_MAP, useValue: mapaDoContexto }`.
 */
export const EXCEPTION_STATUS_MAP = Symbol('EXCEPTION_STATUS_MAP');
