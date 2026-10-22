import type { CustomerIdentityRepository } from '../../domain/contracts/customer-identity-repository.interface';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export class ValidateAuthenticatedCustomerUseCase {
  constructor(
    private readonly customerIdentityRepository: CustomerIdentityRepository,
  ) {}

  async execute(payload: { sub?: string }): Promise<AuthenticatedCustomer> {
    if (
      !payload.sub ||
      !(await this.customerIdentityRepository.existsActive(payload.sub))
    ) {
      throw new InvalidCredentialsException();
    }

    return new AuthenticatedCustomer(payload.sub);
  }
}
