import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ValidateAuthenticatedUserUseCase } from '../../application/usecases/validate-authenticated-user.usecase';
import { ValidateAuthenticatedCustomerUseCase } from '../../application/usecases/validate-authenticated-customer.usecase';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { JwtStrategy } from './jwt.strategy';

type StrategyOptions = {
  algorithms?: string[];
  issuer?: string[];
};

describe('JwtStrategy', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const validateAuthenticatedUserUseCase = { execute: jest.fn() };
  const validateAuthenticatedCustomerUseCase = { execute: jest.fn() };
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

  it('should validate the staff token payload through the user use case', async () => {
    const authenticatedUser = new AuthenticatedUser(
      'user-1',
      'Ana Santos',
      'ana.santos@oficina.com',
      UserRole.ATTENDANT,
    );
    validateAuthenticatedUserUseCase.execute.mockResolvedValue(
      authenticatedUser,
    );

    const payload = {
      sub: 'user-1',
      role: UserRole.ATTENDANT,
      iss: 'techchallenge-app',
    };

    await expect(strategy.validate(payload)).resolves.toBe(authenticatedUser);
    expect(validateAuthenticatedUserUseCase.execute.mock.calls).toEqual([
      [payload],
    ]);
    expect(validateAuthenticatedCustomerUseCase.execute).not.toHaveBeenCalled();
  });

  it('should route the Lambda token (iss techchallenge-auth-lambda) to the customer use case', async () => {
    const customer = new AuthenticatedCustomer('customer-1');
    validateAuthenticatedCustomerUseCase.execute.mockResolvedValue(customer);

    const payload = {
      sub: 'customer-1',
      type: 'customer',
      iss: 'techchallenge-auth-lambda',
    };

    await expect(strategy.validate(payload)).resolves.toBe(customer);
    expect(validateAuthenticatedCustomerUseCase.execute.mock.calls).toEqual([
      [payload],
    ]);
    expect(validateAuthenticatedUserUseCase.execute).not.toHaveBeenCalled();
  });

  it('should only accept HS256 tokens from the two RFC-001 issuers', () => {
    // O passport-jwt guarda as opções de verificação no próprio Strategy.
    const options = (strategy as unknown as { _verifOpts: StrategyOptions })
      ._verifOpts;

    expect(options.algorithms).toEqual(['HS256']);
    expect(options.issuer).toEqual([
      'techchallenge-app',
      'techchallenge-auth-lambda',
    ]);
  });

  it('should reject a token without iss before reaching any use case', () => {
    const token = jwt.sign({ sub: 'user-1' }, 'test-secret', {
      algorithm: 'HS256',
    });
    const options = (strategy as unknown as { _verifOpts: StrategyOptions })
      ._verifOpts;

    expect(() =>
      jwt.verify(token, 'test-secret', {
        algorithms: options.algorithms as jwt.Algorithm[],
        issuer: options.issuer as [string, ...string[]],
      }),
    ).toThrow('jwt issuer invalid');
  });
});
