import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';

export interface RequestWithUser {
  user: AuthenticatedUser;
}
