import InvalidLicensePlateException from '@customer-management/domain/exceptions/invalid-license-plate.exception';

export default class LicensePlate {
  public readonly value: string;

  constructor(value: string) {
    const cleanedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

    if (!this.validate(cleanedValue)) {
      throw new InvalidLicensePlateException(
        'Invalid license plate format. Must be Mercosul or traditional Brazilian format.',
      );
    }

    this.value = cleanedValue;
  }

  private validate(value: string): boolean {
    const mercosulRegex = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
    const traditionalRegex = /^[A-Z]{3}[0-9]{4}$/;

    return mercosulRegex.test(value) || traditionalRegex.test(value);
  }

  public equals(other: LicensePlate): boolean {
    return this.value === other.value;
  }
}
