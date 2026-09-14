import { UserRole } from '../enums/user-role.enum';
import { AuthenticatedUser } from './authenticated-user.entity';

type InternalUserProps = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
};

export class InternalUser {
  constructor(private readonly props: InternalUserProps) {}

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get passwordHash(): string | undefined {
    return this.props.passwordHash;
  }

  toAuthenticatedUser(): AuthenticatedUser {
    return new AuthenticatedUser(this.id, this.name, this.email, this.role);
  }
}
