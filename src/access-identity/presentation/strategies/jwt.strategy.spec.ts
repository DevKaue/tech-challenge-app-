import { UserRole } from '../../domain/enums/user-role.enum';
import { ValidateAuthenticatedUserUseCase } from '../../application/usecases/validate-authenticated-user.usecase';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  const originalJwtSecret = process.env.JWT_SECRET;
  const validateAuthenticatedUserUseCase = {
    execute: jest.fn(),
  };
  let strategy: JwtStrategy;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
    validateAuthenticatedUserUseCase.execute.mockReset();
    strategy = new JwtStrategy(
      validateAuthenticatedUserUseCase as unknown as ValidateAuthenticatedUserUseCase,
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
  });
});
