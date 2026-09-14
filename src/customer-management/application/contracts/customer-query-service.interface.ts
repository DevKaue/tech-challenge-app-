import type CustomerDTO from '@customer-management/application/dtos/customer.dto';

export default abstract class CustomerQueryServiceInterface {
  abstract getById(props: { id: string }): Promise<CustomerDTO>;
  abstract findAll(): Promise<CustomerDTO[]>;
}
