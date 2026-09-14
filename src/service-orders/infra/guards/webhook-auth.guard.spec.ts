import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { WebhookAuthGuard } from './webhook-auth.guard';

describe('WebhookAuthGuard', () => {
  const secret = process.env.WEBHOOK_SECRET ?? 'test-webhook-secret';
  const guard = new WebhookAuthGuard();

  const sign = (body: string, signingSecret: string = secret) =>
    `sha256=${createHmac('sha256', signingSecret).update(body).digest('hex')}`;

  const mockContext = (
    headers: Record<string, string>,
    rawBody?: Buffer,
    body?: unknown,
  ) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ headers, rawBody, body }),
      }),
    }) as unknown as ExecutionContext;

  it('accepts a valid signature', () => {
    const body = JSON.stringify({ decision: 'APPROVED' });
    const context = mockContext(
      { 'x-webhook-signature': sign(body) },
      Buffer.from(body),
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects when signature header is missing', () => {
    const context = mockContext({});

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects when algorithm is not sha256', () => {
    const body = JSON.stringify({ decision: 'APPROVED' });
    const context = mockContext(
      { 'x-webhook-signature': 'md5=not-a-valid-signature' },
      Buffer.from(body),
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects when the body was tampered', () => {
    const body = JSON.stringify({ decision: 'APPROVED' });
    const tampered = JSON.stringify({ decision: 'REJECTED' });
    const context = mockContext(
      { 'x-webhook-signature': sign(body) },
      Buffer.from(tampered),
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('rejects when signed with a different secret', () => {
    const body = JSON.stringify({ decision: 'APPROVED' });
    const context = mockContext(
      { 'x-webhook-signature': sign(body, 'other-secret') },
      Buffer.from(body),
    );

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('falls back to serialized body when rawBody is unavailable', () => {
    const body = { decision: 'APPROVED' };
    const context = mockContext(
      { 'x-webhook-signature': sign(JSON.stringify(body)) },
      undefined,
      body,
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
