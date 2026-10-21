import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

function isValidCpf(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(clean.substring(10, 11))) return false;

  return true;
}

function isValidCnpj(cnpj: string): boolean {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  let length = clean.length - 2;
  let numbers = clean.substring(0, length);
  const digits = clean.substring(length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = clean.substring(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

@ValidatorConstraint({ name: 'isValidDocument', async: false })
export class IsValidDocumentConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') return false;

    const docTypeField = args.constraints?.[0] || 'documentType';
    const obj = args.object as Record<string, any>;
    const docType = obj[docTypeField];

    if (docType === 'CPF') {
      return isValidCpf(value);
    }

    if (docType === 'CNPJ') {
      return isValidCnpj(value);
    }

    if (docType === 'PASSPORT' || docType === 'RNE') {
      return value.trim().length > 0;
    }

    return false;
  }

  defaultMessage(args: ValidationArguments) {
    const docTypeField = args.constraints?.[0] || 'documentType';
    const obj = args.object as Record<string, any>;
    const docType = obj[docTypeField];

    if (docType === 'CPF') {
      return 'Document must be a valid Brazilian CPF';
    }
    if (docType === 'CNPJ') {
      return 'Document must be a valid Brazilian CNPJ';
    }
    return 'Document must not be empty';
  }
}

export function IsValidDocument(
  docTypeField?: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidDocument',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [docTypeField ?? 'documentType'],
      options: validationOptions,
      validator: IsValidDocumentConstraint,
    });
  };
}
