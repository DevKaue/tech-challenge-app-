import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import Email from '@customer-management/domain/value-objects/email.vo';
import { toCustomerDTO } from '@customer-management/application/dtos/customer.dto';
import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

export type UpdateCustomerInput = {
  id: string;
  name?: string;
  phone?: string | null;
  email?: string | null;
};

export type UpdateCustomerOutput = {
  customer: CustomerDTO;
};

export default class UpdateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async execute(input: UpdateCustomerInput): Promise<UpdateCustomerOutput> {
    const customer = await this.customerRepository.getById(input.id);

    if (input.name != null) {
      customer.changeName(input.name);
    }

    if (input.phone !== undefined) {
      customer.changePhone(input.phone ?? undefined);
    }

    if (input.email !== undefined) {
      customer.changeEmail(
        input.email !== null ? new Email(input.email) : undefined,
      );
    }

    await this.customerRepository.update(customer);

    return {
      customer: toCustomerDTO(customer),
    };
  }
}
