import type { NextFunction, Request, Response } from 'express';
import {
  CORRELATION_HEADER,
  correlationIdMiddleware,
  currentRequestContext,
  elapsedMs,
} from './request-context';

function call(received: string | undefined): {
  seen: string | undefined;
  header: jest.Mock;
} {
  const header = jest.fn();
  const req = { header: () => received } as unknown as Request;
  const res = { setHeader: header } as unknown as Response;
  let seen: string | undefined;
  correlationIdMiddleware(req, res, (() => {
    seen = currentRequestContext()?.correlationId;
  }) as NextFunction);
  return { seen, header };
}

describe('correlationIdMiddleware', () => {
  it('propaga o id gerado pelo Kong e devolve no header', () => {
    const { seen, header } = call('0f6c3d2e-6a1b-4c39-9a4e-0d7f5b2c8e11#12');

    expect(seen).toBe('0f6c3d2e-6a1b-4c39-9a4e-0d7f5b2c8e11#12');
    expect(header).toHaveBeenCalledWith(
      CORRELATION_HEADER,
      '0f6c3d2e-6a1b-4c39-9a4e-0d7f5b2c8e11#12',
    );
  });

  it('gera um UUID quando o header não vem', () => {
    const { seen } = call(undefined);

    expect(seen).toMatch(/^[0-9a-f-]{36}$/);
  });

  it.each([
    ['quebra de linha', 'abc\n{"level":"error"}'],
    ['aspas', 'abc"def'],
    ['tamanho', 'a'.repeat(129)],
  ])('descarta valor inválido (%s)', (_caso, valor) => {
    const { seen } = call(valor);

    expect(seen).not.toBe(valor);
    expect(seen).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('não vaza o contexto para fora da requisição', () => {
    call('abc');

    expect(currentRequestContext()).toBeUndefined();
  });

  it('mede o tempo decorrido desde a entrada', () => {
    let ms: number | null = null;
    const req = { header: () => undefined } as unknown as Request;
    const res = { setHeader: jest.fn() } as unknown as Response;
    correlationIdMiddleware(req, res, (() => {
      ms = elapsedMs(currentRequestContext());
    }) as NextFunction);

    expect(ms).not.toBeNull();
    expect(ms!).toBeGreaterThanOrEqual(0);
    expect(elapsedMs(undefined)).toBeNull();
  });
});
