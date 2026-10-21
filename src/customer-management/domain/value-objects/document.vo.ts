import { DocumentType } from '@customer-management/domain/enums/document-type.enum';
import InvalidDocumentException from '@customer-management/domain/exceptions/invalid-document.exception';

export default class Document {
  public readonly type: DocumentType;
  public readonly value: string;

  constructor(type: DocumentType, value: string) {
    const cleanedValue = value.replace(/\D/g, '');

    if (!this.validate(type, cleanedValue)) {
      throw new InvalidDocumentException(`Invalid ${type} document.`);
    }

    this.type = type;
    this.value = cleanedValue;
  }

  private validate(type: DocumentType, value: string): boolean {
    if (type === DocumentType.CPF) {
      return this.validateCPF(value);
    }
    if (type === DocumentType.CNPJ) {
      return this.validateCNPJ(value);
    }
    return false;
  }

  private validateCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    // Cálculo do 1º Dígito Verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    // Cálculo do 2º Dígito Verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;
  }

  private validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    // Cálculo do 1º Dígito Verificador
    let size = cnpj.length - 2;
    let numbers = cnpj.substring(0, size);
    const digits = cnpj.substring(size);

    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Cálculo do 2º Dígito Verificador
    size = size + 1;
    numbers = cnpj.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
      sum += parseInt(numbers.charAt(size - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}
