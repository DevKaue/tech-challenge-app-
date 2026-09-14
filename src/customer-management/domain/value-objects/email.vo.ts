import DomainException from '@customer-management/domain/exceptions/domain.exception';

export default class Email {
  public readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new DomainException('Invalid email format.');
    }
    this.value = value;
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  public toString(): string {
    return this.value;
  }
}
