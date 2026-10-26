import { JsonLogger } from './json-logger';
import { correlationIdMiddleware } from './request-context';
import type { NextFunction, Request, Response } from 'express';

function capture(): {
  logger: JsonLogger;
  lines: () => Record<string, unknown>[];
} {
  const out: string[] = [];
  const logger = new JsonLogger((line) => out.push(line));
  return {
    logger,
    lines: () => out.map((l) => JSON.parse(l) as Record<string, unknown>),
  };
}

function runInRequest(correlationId: string, fn: () => void): void {
  const req = { header: () => correlationId } as unknown as Request;
  const res = { setHeader: jest.fn() } as unknown as Response;
  correlationIdMiddleware(req, res, fn as NextFunction);
}

describe('JsonLogger', () => {
  it('escreve uma linha JSON por chamada, terminada em \\n', () => {
    const out: string[] = [];
    new JsonLogger((line) => out.push(line)).log('subiu', 'Bootstrap');

    expect(out).toHaveLength(1);
    expect(out[0].endsWith('\n')).toBe(true);
    expect(JSON.parse(out[0])).toEqual(
      expect.objectContaining({
        level: 'info',
        message: 'subiu',
        context: 'Bootstrap',
        service: 'techchallenge-api',
      }),
    );
  });

  it('espalha mensagem objeto no topo da linha (vira atributo no New Relic)', () => {
    const { logger, lines } = capture();
    logger.log(
      { event: 'service_order.created', serviceOrderId: 'os-1' },
      'ServiceOrders',
    );

    expect(lines()[0]).toEqual(
      expect.objectContaining({
        event: 'service_order.created',
        serviceOrderId: 'os-1',
        context: 'ServiceOrders',
      }),
    );
  });

  it('inclui o correlationId da requisição corrente', () => {
    const { logger, lines } = capture();
    runInRequest('0f6c3d2e-6a1b-4c39-9a4e-0d7f5b2c8e11#12', () =>
      logger.warn({ event: 'http.request' }, 'HTTP'),
    );

    expect(lines()[0].correlationId).toBe(
      '0f6c3d2e-6a1b-4c39-9a4e-0d7f5b2c8e11#12',
    );
  });

  it('fora de requisição não inventa correlationId', () => {
    const { logger, lines } = capture();
    logger.log('sem request');

    expect('correlationId' in lines()[0]).toBe(false);
  });

  it('error separa stack e contexto', () => {
    const { logger, lines } = capture();
    logger.error({ event: 'http.error' }, 'Error: boom\n    at x', 'HTTP');

    expect(lines()[0]).toEqual(
      expect.objectContaining({
        level: 'error',
        event: 'http.error',
        context: 'HTTP',
        stack: 'Error: boom\n    at x',
      }),
    );
  });

  it('respeita os níveis configurados pelo Nest', () => {
    const { logger, lines } = capture();
    logger.setLogLevels?.(['error', 'warn']);
    logger.log('some');
    logger.warn('fica');

    expect(lines()).toHaveLength(1);
    expect(lines()[0].message).toBe('fica');
  });
});
