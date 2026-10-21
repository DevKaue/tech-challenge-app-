import { UserRole } from '../../domain/enums/user-role.enum';
import { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { PasswordHasher } from '../../domain/contracts/password-hasher.interface';
import { TokenService } from '../../domain/contracts/token-service.interface';
import { InternalUser } from '../../domain/entities/internal-user.entity';
import { LoginUseCase } from './login.usecase';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let accessIdentityRepository: jest.Mocked<AccessIdentityRepository>;
  let passwordHasher: jest.Mocked<PasswordHasher>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    accessIdentityRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    passwordHasher = {
      hash: jest.fn(),
      verify: jest.fn(),
    };
    tokenService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    useCase = new LoginUseCase(
      accessIdentityRepository,
      passwordHasher,
      tokenService,
    );
  });

  it('should authenticate an internal user and return a JWT', async () => {
    accessIdentityRepository.findByEmail.mockResolvedValue(
      new InternalUser({
        id: 'user-1',
        name: 'Ana Santos',
        email: 'ana.santos@oficina.com',
        role: UserRole.ATTENDANT,
        passwordHash: 'hashed-password',
      }),
    );
    passwordHasher.verify.mockResolvedValue(true);

    const result = await useCase.execute({
      email: 'ANA.SANTOS@OFICINA.COM',
      password: 'Tech@123',
    });

    expect(accessIdentityRepository.findByEmail.mock.calls).toEqual([
      ['ana.santos@oficina.com'],
    ]);
    expect(passwordHasher.verify.mock.calls).toEqual([
      ['Tech@123', 'hashed-password'],
    ]);
    expect(tokenService.sign.mock.calls).toEqual([
      [
        {
          sub: 'user-1',
          email: 'ana.santos@oficina.com',
          role: UserRole.ATTENDANT,
        },
      ],
    ]);
    expect(result).toEqual({
      access_token: 'signed-token',
      token_type: 'Bearer',
      expires_in: 3600,
      user: {
        id: 'user-1',
        name: 'Ana Santos',
        email: 'ana.santos@oficina.com',
        role: UserRole.ATTENDANT,
      },
    });
  });

  it('should reject an unknown email', async () => {
    accessIdentityRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        email: 'missing@oficina.com',
        password: 'Tech@123',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });

  it('should reject an invalid password', async () => {
    accessIdentityRepository.findByEmail.mockResolvedValue(
      new InternalUser({
        id: 'user-1',
        name: 'Ana Santos',
        email: 'ana.santos@oficina.com',
        role: UserRole.ATTENDANT,
        passwordHash: 'hashed-password',
      }),
    );
    passwordHasher.verify.mockResolvedValue(false);

    await expect(
      useCase.execute({
        email: 'ana.santos@oficina.com',
        password: 'Wrong@123',
      }),
    ).rejects.toThrow(InvalidCredentialsException);
  });
});
