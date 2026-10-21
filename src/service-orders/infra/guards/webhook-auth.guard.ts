import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'crypto';
import { env } from '@/common/infra/config/env';

type WebhookRequest = {
  rawBody?: Buffer;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
};

@Injectable()
export class WebhookAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<WebhookRequest>();

    const header = request.headers['x-webhook-signature'];
    if (typeof header !== 'string' || header.length === 0) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const [algorithm, signature] = header.split('=', 2);
    if (algorithm !== 'sha256' || !signature) {
      throw new UnauthorizedException('Invalid webhook signature format');
    }

    const rawBody =
      request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    const expected = createHmac('sha256', env().webhookSecret)
      .update(rawBody)
      .digest('hex');

    const provided = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (
      provided.length !== expectedBuffer.length ||
      !timingSafeEqual(provided, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }

    return true;
  }
}
