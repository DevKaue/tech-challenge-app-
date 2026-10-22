import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { CUSTOMER_ACCESS_KEY } from '../decorators/customer-access.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
    status?: unknown,
  ): TUser {
    const principal = super.handleRequest<TUser>(
      err,
      user,
      info,
      context,
      status,
    );

    // Bloqueio por padrão: o cliente só passa onde a rota diz que aceita.
    if (
      principal instanceof AuthenticatedCustomer &&
      !this.allowsCustomer(context)
    ) {
      throw new ForbiddenException('Customer tokens cannot access this route');
    }

    return principal;
  }

  private allowsCustomer(context: ExecutionContext): boolean {
    return (
      this.reflector.getAllAndOverride<boolean>(CUSTOMER_ACCESS_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) === true
    );
  }
}
