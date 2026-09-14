import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

export type ListCustomerOutput = {
  customers: CustomerDTO[];
};

export default class ListCustomerUseCase {
  constructor(
    private readonly customerQueryService: CustomerQueryServiceInterface,
  ) {}

  async execute(): Promise<ListCustomerOutput> {
    const customers = await this.customerQueryService.findAll();
    return { customers };
  }
}
