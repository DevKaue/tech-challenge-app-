import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class CustomerAlreadyExistsException extends DomainException {
  errorCode: string;

  constructor(message: string = 'Customer already exists') {
    super(message);
    this.name = 'CustomerAlreadyExistsException';
    this.errorCode = 'customer_already_exists';
  }
}
