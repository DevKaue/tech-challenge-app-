import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ValidateAuthenticatedCustomerUseCase } from '../../application/usecases/validate-authenticated-customer.usecase';
import { ValidateAuthenticatedUserUseCase } from '../../application/usecases/validate-authenticated-user.usecase';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const validateAuthenticatedUserUseCase = {
    execute: jest.fn(),
  };
  const validateAuthenticatedCustomerUseCase = {
    execute: jest.fn(),
  };
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    validateAuthenticatedUserUseCase.execute.mockReset();
    validateAuthenticatedCustomerUseCase.execute.mockReset();
    strategy = new JwtStrategy(
      validateAuthenticatedUserUseCase as unknown as ValidateAuthenticatedUserUseCase,
      validateAuthenticatedCustomerUseCase as unknown as ValidateAuthenticatedCustomerUseCase,
    );
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  it('should validate the token payload through the use case', async () => {
    const authenticatedUser = new AuthenticatedUser(
      'user-1',
      'Ana Santos',
      'ana.santos@oficina.com',
      UserRole.ATTENDANT,
    );
    validateAuthenticatedUserUseCase.execute.mockResolvedValue(
      authenticatedUser,
    );

    await expect(
      strategy.validate({ sub: 'user-1', role: UserRole.ATTENDANT }),
    ).resolves.toBe(authenticatedUser);
    expect(validateAuthenticatedUserUseCase.execute.mock.calls).toEqual([
      [{ sub: 'user-1', role: UserRole.ATTENDANT }],
    ]);
    expect(validateAuthenticatedCustomerUseCase.execute).not.toHaveBeenCalled();
  });

  it('should validate a customer token through the customer use case', async () => {
    const customer = new AuthenticatedCustomer('customer-1');
    validateAuthenticatedCustomerUseCase.execute.mockResolvedValue(customer);

    await expect(
      strategy.validate({ sub: 'customer-1', type: 'customer' }),
    ).resolves.toBe(customer);
    expect(validateAuthenticatedUserUseCase.execute).not.toHaveBeenCalled();
  });

  it.each([
    ['employee', validateAuthenticatedUserUseCase, {}],
    ['customer', validateAuthenticatedCustomerUseCase, { type: 'customer' }],
  ])(
    'should answer 401, not 500, when the %s credentials are invalid',
    async (_kind, useCase, extra) => {
      useCase.execute.mockRejectedValue(new InvalidCredentialsException());

      await expect(
        strategy.validate({ sub: 'unknown', ...extra }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    },
  );

  it('should not hide unexpected errors behind a 401', async () => {
    validateAuthenticatedUserUseCase.execute.mockRejectedValue(
      new Error('database down'),
    );

    await expect(strategy.validate({ sub: 'user-1' })).rejects.toThrow(
      'database down',
    );
  });
});
