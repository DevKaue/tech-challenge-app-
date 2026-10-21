import { InternalUser } from '../entities/internal-user.entity';

export const ACCESS_IDENTITY_REPOSITORY = Symbol('ACCESS_IDENTITY_REPOSITORY');

export interface AccessIdentityRepository {
  findByEmail(email: string): Promise<InternalUser | null>;
  findById(id: string): Promise<InternalUser | null>;
}
