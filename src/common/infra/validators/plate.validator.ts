import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidPlate', async: false })
export class IsValidPlateConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false;
    const cleanPlate = value.trim().toUpperCase();

    // Traditional: ABC-1234 or ABC1234
    const traditionalRegex = /^[A-Z]{3}-?[0-9]{4}$/;
    // Mercosul: ABC1D23
    const mercosulRegex = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return traditionalRegex.test(cleanPlate) || mercosulRegex.test(cleanPlate);
  }

  defaultMessage(args: ValidationArguments) {
    return 'License plate must be valid in Brazilian traditional (AAA-9999) or Mercosul (AAA9A99) format.';
  }
}

export function IsValidPlate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidPlate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidPlateConstraint,
    });
  };
}
