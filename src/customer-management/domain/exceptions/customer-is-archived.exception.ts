import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class CustomerIsArchivedException extends DomainException {
  errorCode: string;

  constructor(message = 'Customer is archived and must be restored.') {
    super(message);
    this.name = 'CustomerIsArchivedException';
    this.errorCode = 'customer_is_archived';
  }
}
