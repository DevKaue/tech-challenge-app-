import { IsValidDocumentConstraint } from './document.validator';
import { IsValidPlateConstraint } from './plate.validator';
import { ValidationArguments } from 'class-validator';

function makeArgs(documentType: string): ValidationArguments {
  return {
    object: { documentType },
    property: 'document',
    value: undefined,
    constraints: ['documentType'],
    targetName: '',
  };
}

describe('Custom Validators', () => {
  describe('Document Validator', () => {
    let validator: IsValidDocumentConstraint;

    beforeEach(() => {
      validator = new IsValidDocumentConstraint();
    });

    it('should validate correct CPFs', () => {
      const args = makeArgs('CPF');
      expect(validator.validate('52998224725', args)).toBe(true);
      expect(validator.validate('529.982.247-25', args)).toBe(true);
    });

    it('should reject invalid CPFs', () => {
      const args = makeArgs('CPF');
      expect(validator.validate('12345678912', args)).toBe(false);
      expect(validator.validate('11111111111', args)).toBe(false);
      expect(validator.validate('1234', args)).toBe(false);
    });

    it('should validate correct CNPJs', () => {
      const args = makeArgs('CNPJ');
      expect(validator.validate('11222333000181', args)).toBe(true);
      expect(validator.validate('11.222.333/0001-81', args)).toBe(true);
    });

    it('should reject invalid CNPJs', () => {
      const args = makeArgs('CNPJ');
      expect(validator.validate('11222333000100', args)).toBe(false);
      expect(validator.validate('00000000000000', args)).toBe(false);
      expect(validator.validate('123', args)).toBe(false);
    });

    it('should accept any non-empty passport', () => {
      const args = makeArgs('PASSPORT');
      expect(validator.validate('AB123456', args)).toBe(true);
      expect(validator.validate('', args)).toBe(false);
    });

    it('should accept any non-empty RNE', () => {
      const args = makeArgs('RNE');
      expect(validator.validate('V123456-7', args)).toBe(true);
      expect(validator.validate('', args)).toBe(false);
    });
  });

  describe('Plate Validator', () => {
    let validator: IsValidPlateConstraint;
    const mockArgs = {} as ValidationArguments;

    beforeEach(() => {
      validator = new IsValidPlateConstraint();
    });

    it('should validate correct traditional plates', () => {
      expect(validator.validate('ABC-1234', mockArgs)).toBe(true);
      expect(validator.validate('abc-1234', mockArgs)).toBe(true);
      expect(validator.validate('ABC1234', mockArgs)).toBe(true);
    });

    it('should validate correct Mercosul plates', () => {
      expect(validator.validate('ABC1D23', mockArgs)).toBe(true);
      expect(validator.validate('abc1d23', mockArgs)).toBe(true);
    });

    it('should reject invalid plates', () => {
      expect(validator.validate('AB-1234', mockArgs)).toBe(false);
      expect(validator.validate('ABCD-123', mockArgs)).toBe(false);
      expect(validator.validate('ABC12345', mockArgs)).toBe(false);
    });
  });
});
