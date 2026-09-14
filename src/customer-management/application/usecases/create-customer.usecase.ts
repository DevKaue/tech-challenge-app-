import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';

import { toCustomerDTO } from '@customer-management/application/dtos/customer.dto';
import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

import CustomerRegistrationChecker from '@/customer-management/domain/services/customer-registration-checker.service';

export type CreateCustomerInput = {
  documentType: string;
  documentNumber: string;
  name: string;
  phone: string;
  email: string;
};

export type CreateCustomerOutput = {
  customer: CustomerDTO;
};

export default class CreateCustomerUseCase {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly registrationChecker: CustomerRegistrationChecker,
  ) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerOutput> {
    const customer = CustomerFactory.create({
      documentType: input.documentType,
      documentNumber: input.documentNumber,
      name: input.name,
      email: input.email,
      phone: input.phone,
    });

    await this.registrationChecker.checkUniqueness(customer.document);

    await this.customerRepository.create(customer);

    const output: CreateCustomerOutput = {
      customer: toCustomerDTO(customer),
    };

    return output;
  }
}
