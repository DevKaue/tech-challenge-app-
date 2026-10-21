import type { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import type { PasswordHasher } from '../../domain/contracts/password-hasher.interface';
import type { TokenService } from '../../domain/contracts/token-service.interface';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { ForbiddenRoleException } from '../../domain/exceptions/forbidden-role.exception';
import { UserRole } from '../../domain/enums/user-role.enum';

export const tokenExpiresInSeconds = 60 * 60;

export type LoginUseCaseInput = {
  email: string;
  password: string;
};

export type LoginUseCaseOutput = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
};

export class LoginUseCase {
  constructor(
    private readonly accessIdentityRepository: AccessIdentityRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    input: LoginUseCaseInput,
    requiredRole?: UserRole,
  ): Promise<LoginUseCaseOutput> {
    const email = input.email.trim().toLowerCase();
    const user = await this.accessIdentityRepository.findByEmail(email);

    if (!user?.passwordHash) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.passwordHasher.verify(
      input.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    if (requiredRole && user.role !== requiredRole) {
      throw new ForbiddenRoleException();
    }

    return {
      access_token: this.tokenService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      token_type: 'Bearer',
      expires_in: tokenExpiresInSeconds,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
