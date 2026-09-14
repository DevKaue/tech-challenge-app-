import { UserRole } from '../../domain/enums/user-role.enum';
import type { AccessIdentityRepository } from '../../domain/contracts/access-identity-repository.interface';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

export type ValidateAuthenticatedUserInput = {
  sub?: string;
  email?: string;
  role?: UserRole;
};

export class ValidateAuthenticatedUserUseCase {
  constructor(
    private readonly accessIdentityRepository: AccessIdentityRepository,
  ) {}

  async execute(
    payload: ValidateAuthenticatedUserInput,
  ): Promise<AuthenticatedUser> {
    if (!payload.sub) {
      throw new InvalidCredentialsException();
    }

    const user = await this.accessIdentityRepository.findById(payload.sub);

    if (!user) {
      throw new InvalidCredentialsException();
    }

    return user.toAuthenticatedUser();
  }
}
