import type { CustomerIdentityRepository } from '../../domain/contracts/customer-identity-repository.interface';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { CustomerStatus } from '../../domain/enums/customer-status.enum';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export type ValidateAuthenticatedCustomerInput = {
  sub?: string;
  type?: string;
};

/**
 * Revalida o cliente a cada requisição, com a mesma regra da Lambda: existe,
 * não está arquivado e está ACTIVE. É o que fecha a janela de até 1 h (o `exp`
 * do token) entre bloquear um cliente e ele perder o acesso, já que o Kong só
 * confere assinatura e expiração.
 */
export class ValidateAuthenticatedCustomerUseCase {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async execute(
    payload: ValidateAuthenticatedCustomerInput,
  ): Promise<AuthenticatedCustomer> {
    if (payload.type !== 'customer' || !payload.sub) {
      throw new InvalidCredentialsException();
    }

    const customer = await this.customerIdentityRepository.findById(
      payload.sub,
    );

    if (
      !customer ||
      customer.deletedAt !== null ||
      customer.status !== CustomerStatus.ACTIVE
    ) {
      throw new InvalidCredentialsException();
    }

    return new AuthenticatedCustomer(customer.id);
  }
}
