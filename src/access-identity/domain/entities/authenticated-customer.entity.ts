/**
 * Cliente autenticado pelo token que a Lambda de CPF emite (`type: customer`).
 * Não tem papel nem e-mail: só pode usar as rotas marcadas com `@CustomerAccess()`.
 */
export class AuthenticatedCustomer {
  constructor(public readonly customerId: string) {}
}
