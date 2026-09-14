import { UserRole } from '../../domain/enums/user-role.enum';
import { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { InternalUser } from '../../domain/entities/internal-user.entity';
import { ValidateAuthenticatedUserUseCase } from './validate-authenticated-user.usecase';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

describe('ValidateAuthenticatedUserUseCase', () => {
  let useCase: ValidateAuthenticatedUserUseCase;
  let accessIdentityRepository: jest.Mocked<AccessIdentityRepository>;

  beforeEach(() => {
    accessIdentityRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    useCase = new ValidateAuthenticatedUserUseCase(accessIdentityRepository);
  });

  it('should resolve the authenticated user from the token subject', async () => {
    accessIdentityRepository.findById.mockResolvedValue(
      new InternalUser({
        id: 'user-1',
        name: 'Ana Santos',
        email: 'ana.santos@oficina.com',
        role: UserRole.ATTENDANT,
      }),
    );

    await expect(
      useCase.execute({ sub: 'user-1', role: UserRole.ATTENDANT }),
    ).resolves.toEqual({
      userId: 'user-1',
      name: 'Ana Santos',
      email: 'ana.santos@oficina.com',
      role: UserRole.ATTENDANT,
    });
    expect(accessIdentityRepository.findById.mock.calls).toEqual([['user-1']]);
  });

  it('should reject a token without subject', async () => {
    await expect(useCase.execute({})).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should reject a token for a missing user', async () => {
    accessIdentityRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ sub: 'missing-user' })).rejects.toThrow(
      InvalidCredentialsException,
    );
  });
});
