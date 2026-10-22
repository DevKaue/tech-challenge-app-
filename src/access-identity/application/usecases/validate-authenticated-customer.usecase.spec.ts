import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { ValidateAuthenticatedCustomerUseCase } from './validate-authenticated-customer.usecase';

describe('ValidateAuthenticatedCustomerUseCase', () => {
  const existsActive = jest.fn();
  let useCase: ValidateAuthenticatedCustomerUseCase;

  beforeEach(() => {
    existsActive.mockReset();
    useCase = new ValidateAuthenticatedCustomerUseCase({ existsActive });
  });

  it('should resolve the customer from the token subject when the customer is active', async () => {
    existsActive.mockResolvedValue(true);

    await expect(useCase.execute({ sub: 'customer-1' })).resolves.toEqual(
      new AuthenticatedCustomer('customer-1'),
    );
    expect(existsActive).toHaveBeenCalledWith('customer-1');
  });

  it('should reject a customer that is inactive, blocked, archived or unknown', async () => {
    existsActive.mockResolvedValue(false);

    await expect(useCase.execute({ sub: 'customer-1' })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should reject a token without subject without querying the repository', async () => {
    await expect(useCase.execute({})).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(existsActive).not.toHaveBeenCalled();
  });
});
