import { UserRole } from '../enums/user-role.enum';

export class AuthenticatedUser {
  constructor(
    public readonly userId: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: UserRole,
  ) {}
}
