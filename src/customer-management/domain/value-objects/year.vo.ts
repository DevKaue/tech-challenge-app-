import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class Year {
  public readonly value: number;

  constructor(value: number) {
    this.validate(value);
    this.value = value;
  }

  private validate(year: number): void {
    if (!Number.isInteger(year) || year < 1000 || year > 9999) {
      throw new DomainException(
        'Invalid year. Year must be a four-digit integer.',
      );
    }
  }
}
