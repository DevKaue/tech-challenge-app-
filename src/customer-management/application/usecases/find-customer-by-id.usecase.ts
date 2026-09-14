import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

export type FindCustomerByIdInput = {
  id: string;
};

export type FindCustomerByIdOutput = {
  customer: CustomerDTO;
};

export default class FindCustomerByIdUseCase {
  constructor(
    private readonly customerQueryService: CustomerQueryServiceInterface,
  ) {}

  async execute(input: FindCustomerByIdInput): Promise<FindCustomerByIdOutput> {
    const customer = await this.customerQueryService.getById({ id: input.id });

    const output: FindCustomerByIdOutput = {
      customer,
    };

    return output;
  }
}
