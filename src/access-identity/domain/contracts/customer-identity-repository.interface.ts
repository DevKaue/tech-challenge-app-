import { CustomerStatus } from '../enums/customer-status.enum';

export const CUSTOMER_IDENTITY_REPOSITORY = Symbol(
  'CUSTOMER_IDENTITY_REPOSITORY',
);

export type CustomerIdentity = {
  id: string;
  status: CustomerStatus;
  deletedAt: Date | null;
};

export interface CustomerIdentityRepository {
  findById(id: string): Promise<CustomerIdentity | null>;
}
