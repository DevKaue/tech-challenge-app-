/**
 * Cliente autenticado pelo token da Lambda de CPF (`iss: techchallenge-auth-lambda`,
 * `type: customer`). Não tem papel: as rotas de funcionário continuam negadas
 * pelo RolesGuard, e as demais só abrem com @CustomerAccess (JwtAuthGuard).
 */
export class AuthenticatedCustomer {
  readonly type = 'customer' as const;

  constructor(public readonly customerId: string) {}
}
