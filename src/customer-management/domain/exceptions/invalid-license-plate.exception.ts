import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class InvalidLicensePlateException extends DomainException {
  errorCode: string;

  constructor(
    message: string = 'Invalid license plate format. Must be Mercosul or traditional Brazilian format.',
  ) {
    super(message);
    this.name = 'InvalidLicensePlateException';
    this.errorCode = 'invalid_license_plate';
  }
}
