import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import Document from '@customer-management/domain/value-objects/document.vo';
import CustomerAlreadyExistsException from '@customer-management/domain/exceptions/customer-already-exists.exception';
import CustomerIsArchivedException from '@customer-management/domain/exceptions/customer-is-archived.exception';

export default class CustomerRegistrationChecker {
  constructor(
    private readonly customerRepository: CustomerRepositoryInterface,
  ) {}

  async checkUniqueness(document: Document): Promise<void> {
    const existingCustomer = await this.customerRepository.findByDocument(
      document,
      {
        includeDeleted: true,
      },
    );

    if (existingCustomer) {
      if (existingCustomer.isArchived()) {
        throw new CustomerIsArchivedException();
      }
      throw new CustomerAlreadyExistsException();
    }
  }
}
