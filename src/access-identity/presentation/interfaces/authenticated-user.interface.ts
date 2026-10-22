import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';

export interface RequestWithUser {
  user: AuthenticatedUser;
}

/** Rota marcada com `@CustomerAccess()`: o principal pode ser funcionário ou cliente. */
export interface RequestWithPrincipal {
  user: AuthenticatedUser | AuthenticatedCustomer;
}

/**
 * Id do cliente quando o token é de cliente; `undefined` para funcionário, que
 * não tem restrição de dono. Passe adiante para filtrar a consulta.
 */
export function customerScopeOf(
  request: RequestWithPrincipal,
): string | undefined {
  return request.user instanceof AuthenticatedCustomer
    ? request.user.customerId
    : undefined;
}
