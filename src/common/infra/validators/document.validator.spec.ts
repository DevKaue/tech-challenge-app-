import { IsValidDocumentConstraint } from './document.validator';

describe('IsValidDocumentConstraint', () => {
  let constraint: IsValidDocumentConstraint;

  beforeEach(() => {
    constraint = new IsValidDocumentConstraint();
  });

  const makeArgs = (obj: Record<string, any>, field = 'documentType') => ({
    object: obj,
    constraints: [field],
    property: 'document',
    targetName: 'TestClass',
    value: obj.document,
  });

  describe('CPF validation', () => {
    it('accepts a valid CPF', () => {
      expect(
        constraint.validate(
          '52998224725',
          makeArgs({ documentType: 'CPF', document: '52998224725' }),
        ),
      ).toBe(true);
    });

    it('accepts a valid CPF with formatting', () => {
      expect(
        constraint.validate(
          '529.982.247-25',
          makeArgs({ documentType: 'CPF', document: '529.982.247-25' }),
        ),
      ).toBe(true);
    });

    it('rejects CPF with wrong length', () => {
      expect(
        constraint.validate(
          '123456',
          makeArgs({ documentType: 'CPF', document: '123456' }),
        ),
      ).toBe(false);
    });

    it('rejects CPF with all same digits', () => {
      expect(
        constraint.validate(
          '11111111111',
          makeArgs({ documentType: 'CPF', document: '11111111111' }),
        ),
      ).toBe(false);
    });

    it('rejects CPF with wrong first check digit', () => {
      expect(
        constraint.validate(
          '52998224726',
          makeArgs({ documentType: 'CPF', document: '52998224726' }),
        ),
      ).toBe(false);
    });

    it('rejects CPF with wrong second check digit', () => {
      expect(
        constraint.validate(
          '52998224735',
          makeArgs({ documentType: 'CPF', document: '52998224735' }),
        ),
      ).toBe(false);
    });
  });

  describe('CNPJ validation', () => {
    it('accepts a valid CNPJ', () => {
      expect(
        constraint.validate(
          '11444777000161',
          makeArgs({ documentType: 'CNPJ', document: '11444777000161' }),
        ),
      ).toBe(true);
    });

    it('accepts a valid CNPJ with formatting', () => {
      expect(
        constraint.validate(
          '11.444.777/0001-61',
          makeArgs({ documentType: 'CNPJ', document: '11.444.777/0001-61' }),
        ),
      ).toBe(true);
    });

    it('rejects CNPJ with wrong length', () => {
      expect(
        constraint.validate(
          '12345678',
          makeArgs({ documentType: 'CNPJ', document: '12345678' }),
        ),
      ).toBe(false);
    });

    it('rejects CNPJ with all same digits', () => {
      expect(
        constraint.validate(
          '11111111111111',
          makeArgs({ documentType: 'CNPJ', document: '11111111111111' }),
        ),
      ).toBe(false);
    });

    it('rejects CNPJ with wrong first check digit', () => {
      expect(
        constraint.validate(
          '11444777000162',
          makeArgs({ documentType: 'CNPJ', document: '11444777000162' }),
        ),
      ).toBe(false);
    });

    it('rejects CNPJ with wrong second check digit', () => {
      expect(
        constraint.validate(
          '11444777000171',
          makeArgs({ documentType: 'CNPJ', document: '11444777000171' }),
        ),
      ).toBe(false);
    });
  });

  describe('PASSPORT validation', () => {
    it('accepts non-empty passport', () => {
      expect(
        constraint.validate(
          'AB123456',
          makeArgs({ documentType: 'PASSPORT', document: 'AB123456' }),
        ),
      ).toBe(true);
    });

    it('rejects empty passport', () => {
      expect(
        constraint.validate(
          '   ',
          makeArgs({ documentType: 'PASSPORT', document: '   ' }),
        ),
      ).toBe(false);
    });
  });

  describe('RNE validation', () => {
    it('accepts non-empty RNE', () => {
      expect(
        constraint.validate(
          'RNE12345',
          makeArgs({ documentType: 'RNE', document: 'RNE12345' }),
        ),
      ).toBe(true);
    });

    it('rejects empty RNE', () => {
      expect(
        constraint.validate(
          '',
          makeArgs({ documentType: 'RNE', document: '' }),
        ),
      ).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('rejects non-string value', () => {
      expect(
        constraint.validate(
          123456,
          makeArgs({ documentType: 'CPF', document: 123456 }),
        ),
      ).toBe(false);
    });

    it('rejects unknown document type', () => {
      expect(
        constraint.validate(
          '123456',
          makeArgs({ documentType: 'UNKNOWN', document: '123456' }),
        ),
      ).toBe(false);
    });

    it('uses default field name when constraint is not provided', () => {
      const args = {
        object: { documentType: 'CPF', document: '52998224725' },
        constraints: [],
        property: 'document',
        targetName: 'TestClass',
        value: '52998224725',
      };
      expect(constraint.validate('52998224725', args as any)).toBe(true);
    });
  });

  describe('defaultMessage', () => {
    it('returns CPF message for CPF', () => {
      const msg = constraint.defaultMessage(
        makeArgs({ documentType: 'CPF', document: 'x' }),
      );
      expect(msg).toBe('Document must be a valid Brazilian CPF');
    });

    it('returns CNPJ message for CNPJ', () => {
      const msg = constraint.defaultMessage(
        makeArgs({ documentType: 'CNPJ', document: 'x' }),
      );
      expect(msg).toBe('Document must be a valid Brazilian CNPJ');
    });

    it('returns generic message for unknown type', () => {
      const msg = constraint.defaultMessage(
        makeArgs({ documentType: 'XYZ', document: 'x' }),
      );
      expect(msg).toBe('Document must not be empty');
    });

    it('uses default field name when constraint is not provided', () => {
      const args = {
        object: { documentType: 'CPF' },
        constraints: [],
        property: 'document',
        targetName: 'TestClass',
        value: 'x',
      };
      expect(constraint.defaultMessage(args as any)).toBe(
        'Document must be a valid Brazilian CPF',
      );
    });
  });
});
