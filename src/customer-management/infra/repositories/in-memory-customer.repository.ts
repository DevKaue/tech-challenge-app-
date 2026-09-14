import Customer from '@customer-management/domain/entities/customer.entity';
import Document from '@customer-management/domain/value-objects/document.vo';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';

export default class InMemoryCustomerRepository implements CustomerRepositoryInterface {
  private customers: Customer[] = [];

  async getById(id: string): Promise<Customer> {
    const customer = this.customers.find((c) => c.id === id && !c.deletedAt);

    if (!customer) {
      throw new CustomerNotFoundException();
    }

    return customer;
  }

  async findById(id: string): Promise<Customer | null> {
    const customer = this.customers.find((c) => c.id === id && !c.deletedAt);

    if (!customer) {
      return null;
    }

    return customer;
  }

  async findByDocument(
    document: Document,
    options?: { includeDeleted?: boolean },
  ): Promise<Customer | null> {
    const customer = this.customers.find(
      (c) =>
        c.document.value === document.value &&
        c.document.type === document.type &&
        (options?.includeDeleted || !c.deletedAt),
    );

    if (!customer) {
      return null;
    }

    return customer;
  }

  async create(customer: Customer): Promise<void> {
    this.customers.push(customer);
  }

  async update(customer: Customer): Promise<void> {
    const index = this.customers.findIndex((c) => c.id === customer.id);
    if (index !== -1) {
      this.customers[index] = customer;
    }
  }

  async archive(customer: Customer): Promise<void> {
    const index = this.customers.findIndex((c) => c.id === customer.id);
    if (index !== -1) {
      this.customers[index] = customer;
    }
  }
}
