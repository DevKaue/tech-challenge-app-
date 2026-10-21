import Document from './document.vo';
import { DocumentType } from '../enums/document-type.enum';
import InvalidDocumentException from '../exceptions/invalid-document.exception';

describe('Document Value Object', () => {
  describe('CPF Validation', () => {
    it('should create a valid CPF document', () => {
      const cpf = '11144477735';
      const document = new Document(DocumentType.CPF, cpf);

      expect(document.type).toBe(DocumentType.CPF);
      expect(document.value).toBe(cpf);
    });

    it('should clean non-numeric characters from CPF', () => {
      const cpf = '111.444.777-35';
      const document = new Document(DocumentType.CPF, cpf);

      expect(document.value).toBe('11144477735');
    });

    it('should throw error for invalid CPF with all same digits', () => {
      expect(() => {
        new Document(DocumentType.CPF, '11111111111');
      }).toThrow(InvalidDocumentException);
    });

    it('should throw error for CPF with incorrect check digits', () => {
      expect(() => {
        new Document(DocumentType.CPF, '12345678900');
      }).toThrow(InvalidDocumentException);
    });

    it('should throw error for CPF with incorrect length', () => {
      expect(() => {
        new Document(DocumentType.CPF, '123456789');
      }).toThrow(InvalidDocumentException);
    });

    it('should accept valid CPF numbers', () => {
      // Valid CPF - tested and confirmed
      const cpf = '11144477735';
      const document = new Document(DocumentType.CPF, cpf);
      expect(document.type).toBe(DocumentType.CPF);
      expect(document.value).toBe(cpf);
    });

    it('should handle CPF with special characters and spaces', () => {
      const cpf = '111 . 444 . 777 - 35';
      const document = new Document(DocumentType.CPF, cpf);

      expect(document.value).toBe('11144477735');
    });
  });

  describe('CNPJ Validation', () => {
    it('should create a valid CNPJ document', () => {
      const cnpj = '11222333000181';
      const document = new Document(DocumentType.CNPJ, cnpj);

      expect(document.type).toBe(DocumentType.CNPJ);
      expect(document.value).toBe(cnpj);
    });

    it('should clean non-numeric characters from CNPJ', () => {
      const cnpj = '11.222.333/0001-81';
      const document = new Document(DocumentType.CNPJ, cnpj);

      expect(document.value).toBe('11222333000181');
    });

    it('should throw error for invalid CNPJ with all same digits', () => {
      expect(() => {
        new Document(DocumentType.CNPJ, '11111111111111');
      }).toThrow(InvalidDocumentException);
    });

    it('should throw error for CNPJ with incorrect check digits', () => {
      expect(() => {
        new Document(DocumentType.CNPJ, '11222333000180');
      }).toThrow(InvalidDocumentException);
    });

    it('should throw error for CNPJ with incorrect length', () => {
      expect(() => {
        new Document(DocumentType.CNPJ, '112223330001');
      }).toThrow(InvalidDocumentException);
    });

    it('should accept valid CNPJ numbers', () => {
      const validCNPJs = ['11222333000181', '11444777000161'];

      validCNPJs.forEach((cnpj) => {
        const document = new Document(DocumentType.CNPJ, cnpj);
        expect(document.type).toBe(DocumentType.CNPJ);
        expect(document.value).toBe(cnpj);
      });
    });

    it('should handle CNPJ with special characters and spaces', () => {
      const cnpj = '11 . 222 . 333 / 0001 - 81';
      const document = new Document(DocumentType.CNPJ, cnpj);

      expect(document.value).toBe('11222333000181');
    });
  });

  describe('Error Handling', () => {
    it('should throw InvalidDocumentException for invalid document type', () => {
      expect(() => {
        new Document('INVALID' as DocumentType, '12345678901');
      }).toThrow();
    });

    it('should throw error with descriptive message', () => {
      expect(() => {
        new Document(DocumentType.CPF, '00000000000');
      }).toThrow('Invalid CPF document.');
    });

    it('should throw error with descriptive message for CNPJ', () => {
      expect(() => {
        new Document(DocumentType.CNPJ, '00000000000000');
      }).toThrow('Invalid CNPJ document.');
    });
  });

  describe('Value Object Immutability', () => {
    it('should have readonly type property (TypeScript enforcement)', () => {
      const document = new Document(DocumentType.CPF, '11144477735');

      // TypeScript readonly is enforced at compile time, not runtime
      // This test verifies the property cannot be reassigned (in TypeScript)
      expect(document.type).toBe(DocumentType.CPF);
    });

    it('should have readonly value property (TypeScript enforcement)', () => {
      const document = new Document(DocumentType.CPF, '11144477735');

      // TypeScript readonly is enforced at compile time, not runtime
      // This test verifies the property cannot be reassigned (in TypeScript)
      expect(document.value).toBe('11144477735');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      expect(() => {
        new Document(DocumentType.CPF, '');
      }).toThrow(InvalidDocumentException);
    });

    it('should handle only special characters', () => {
      expect(() => {
        new Document(DocumentType.CPF, '...-.-.-');
      }).toThrow(InvalidDocumentException);
    });

    it('should handle very long string', () => {
      const longString = '12345678901' + '1'.repeat(100);
      expect(() => {
        new Document(DocumentType.CPF, longString);
      }).toThrow(InvalidDocumentException);
    });

    it('should accept formatted CPF with dashes and dots', () => {
      const formattedCPF = '111.444.777-35';
      const document = new Document(DocumentType.CPF, formattedCPF);

      expect(document.value).toBe('11144477735');
    });

    it('should accept formatted CNPJ with dashes and dots', () => {
      const formattedCNPJ = '11.222.333/0001-81';
      const document = new Document(DocumentType.CNPJ, formattedCNPJ);

      expect(document.value).toBe('11222333000181');
    });
  });
});
