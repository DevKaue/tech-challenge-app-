import { CustomerIdentityRepository } from '../../domain/contracts/customer-identity-repository.interface';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { CustomerStatus } from '../../domain/enums/customer-status.enum';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { ValidateAuthenticatedCustomerUseCase } from './validate-authenticated-customer.usecase';

describe('ValidateAuthenticatedCustomerUseCase', () => {
  let repository: jest.Mocked<CustomerIdentityRepository>;
  let useCase: ValidateAuthenticatedCustomerUseCase;

  beforeEach(() => {
    repository = { findById: jest.fn() };
    useCase = new ValidateAuthenticatedCustomerUseCase(repository);
  });

  it('should resolve an active customer from the token subject', async () => {
    repository.findById.mockResolvedValue({
      id: 'customer-1',
      status: CustomerStatus.ACTIVE,
      deletedAt: null,
    });

    await expect(
      useCase.execute({ sub: 'customer-1', type: 'customer' }),
    ).resolves.toEqual(new AuthenticatedCustomer('customer-1'));
    expect(repository.findById.mock.calls).toEqual([['customer-1']]);
  });

  it.each([
    ['without subject', { type: 'customer' }],
    ['without type', { sub: 'customer-1' }],
    ['with another type', { sub: 'customer-1', type: 'staff' }],
  ])('should reject a token %s', async (_case, payload) => {
    await expect(useCase.execute(payload)).rejects.toThrow(
      InvalidCredentialsException,
    );
    expect(repository.findById.mock.calls).toEqual([]);
  });

  it('should reject a customer that no longer exists', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ sub: 'customer-1', type: 'customer' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should reject an archived customer', async () => {
    repository.findById.mockResolvedValue({
      id: 'customer-1',
      status: CustomerStatus.ACTIVE,
      deletedAt: new Date('2026-10-01T00:00:00.000Z'),
    });

    await expect(
      useCase.execute({ sub: 'customer-1', type: 'customer' }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it.each([CustomerStatus.INACTIVE, CustomerStatus.BLOCKED])(
    'should reject a %s customer even with a valid token',
    async (status) => {
      repository.findById.mockResolvedValue({
        id: 'customer-1',
        status,
        deletedAt: null,
      });

      await expect(
        useCase.execute({ sub: 'customer-1', type: 'customer' }),
      ).rejects.toThrow(InvalidCredentialsException);
    },
  );
});
