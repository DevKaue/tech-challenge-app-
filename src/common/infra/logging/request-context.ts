import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export type RequestContext = {
  correlationId: string;
  startedAt: bigint;
};

const storage = new AsyncLocalStorage<RequestContext>();

/**
 * Mesmo formato aceito pela Lambda de autenticação. O Kong gera
 * `<uuid>#<n>`; qualquer coisa fora disso (tamanho, quebra de linha, aspas)
 * vira log injection ou cardinalidade sem limite no New Relic, então é trocada
 * por um UUID novo.
 */
const CORRELATION_ID = /^[A-Za-z0-9._:#-]{1,128}$/;

export const CORRELATION_HEADER = 'x-correlation-id';

export function currentRequestContext(): RequestContext | undefined {
  return storage.getStore();
}

export function elapsedMs(context: RequestContext | undefined): number | null {
  if (!context) return null;
  return Number(process.hrtime.bigint() - context.startedAt) / 1e6;
}

/**
 * Middleware Express registrado antes de tudo em main.ts. Abre o contexto da
 * requisição: tudo que roda depois (guards, use cases, Prisma, filters) e
 * escreve log leva o mesmo correlationId, e o cliente recebe o id de volta no
 * header para citá-lo num chamado.
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const received = req.header(CORRELATION_HEADER);
  const correlationId =
    received && CORRELATION_ID.test(received) ? received : randomUUID();

  res.setHeader(CORRELATION_HEADER, correlationId);
  storage.run({ correlationId, startedAt: process.hrtime.bigint() }, next);
}
