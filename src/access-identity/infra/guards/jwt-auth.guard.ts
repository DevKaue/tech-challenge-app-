import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import {
  CUSTOMER_ACCESS_KEY,
  CustomerAccessRule,
} from '../decorators/customer-access.decorator';

type GuardedRequest = {
  user?: unknown;
  params?: Record<string, string | undefined>;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  // O `validate` do JwtStrategy lança InvalidCredentialsException (usuário ou
  // cliente inexistente, cliente bloqueado). Quem traduz essa exceção para 401
  // é o filtro do módulo access-identity; num controller de outro módulo ela
  // chegava como 500. Aqui ela vira 401 em qualquer rota.
  handleRequest<TUser>(err: unknown, user: TUser | false): TUser {
    if (err instanceof InvalidCredentialsException) {
      throw new UnauthorizedException();
    }
    if (err instanceof Error) throw err;
    if (err || !user) throw new UnauthorizedException();
    return user;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authenticated = (await super.canActivate(context)) as boolean;
    if (!authenticated) return false;

    const request = context.switchToHttp().getRequest<GuardedRequest>();
    if (!(request.user instanceof AuthenticatedCustomer)) return true;

    // Negação por padrão: várias rotas de OS só têm JwtAuthGuard, sem @Roles.
    // Sem esta regra, um token de cliente mudaria status e encerraria OS.
    const rule = this.reflector.getAllAndOverride<
      CustomerAccessRule | undefined
    >(CUSTOMER_ACCESS_KEY, [context.getHandler(), context.getClass()]);
    if (!rule) {
      throw new ForbiddenException('Rota não disponível para cliente');
    }

    const resourceId = request.params?.[rule.param];
    const owner = resourceId ? await this.ownerOf(rule, resourceId) : null;

    // 404 e não 403 para a OS de outro cliente: o mesmo princípio da Lambda,
    // que não distingue "não existe" de "não é seu".
    if (owner !== request.user.customerId) {
      throw new NotFoundException('Recurso não encontrado');
    }
    return true;
  }

  private async ownerOf(
    rule: CustomerAccessRule,
    resourceId: string,
  ): Promise<string | null> {
    if (rule.resource === 'service-order') {
      const order = await this.prisma.serviceOrder.findUnique({
        where: { id: resourceId },
        select: { customerId: true },
      });
      return order?.customerId ?? null;
    }

    const estimate = await this.prisma.estimate.findUnique({
      where: { id: resourceId },
      select: { serviceOrder: { select: { customerId: true } } },
    });
    return estimate?.serviceOrder.customerId ?? null;
  }
}
