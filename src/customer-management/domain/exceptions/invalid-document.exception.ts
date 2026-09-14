import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class InvalidDocumentException extends DomainException {
  errorCode: string;

  constructor(message: string = 'Invalid document.') {
    super(message);
    this.name = 'InvalidDocumentException';
    this.errorCode = 'invalid_document';
  }
}
