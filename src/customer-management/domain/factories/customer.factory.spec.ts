import CustomerFactory from './customer.factory';
import { DocumentType } from '../enums/document-type.enum';
import Customer from '../entities/customer.entity';

describe('CustomerFactory', () => {
  describe('create', () => {
    it('should create a customer with all properties', () => {
      const customerId = 'customer-123';
      const documentType = DocumentType.CPF;
      const documentNumber = '11144477735';
      const name = 'John Doe';
      const email = 'john@example.com';
      const phone = '11999999999';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const customer = CustomerFactory.create({
        id: customerId,
        documentType,
        documentNumber,
        name,
        email,
        phone,
        createdAt,
        updatedAt,
      });

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.id).toBe(customerId);
      expect(customer.document.type).toBe(documentType);
      expect(customer.document.value).toBe('11144477735');
      expect(customer.name).toBe(name);
      expect(customer.email?.value).toBe(email);
      expect(customer.phone).toBe(phone);
      expect(customer.createdAt).toBe(createdAt);
      expect(customer.updatedAt).toBe(updatedAt);
    });

    it('should create a customer without optional properties', () => {
      const documentType = DocumentType.CNPJ;
      const documentNumber = '11222333000181';
      const name = 'Company Inc';

      const customer = CustomerFactory.create({
        documentType,
        documentNumber,
        name,
      });

      expect(customer).toBeInstanceOf(Customer);
      expect(customer.document.type).toBe(documentType);
      expect(customer.document.value).toBe('11222333000181');
      expect(customer.name).toBe(name);
      expect(customer.email).toBeUndefined();
      expect(customer.phone).toBeUndefined();
    });

    it('should generate a random UUID if id is not provided', () => {
      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
      });

      expect(customer.id).toBeDefined();
      expect(typeof customer.id).toBe('string');
      expect(customer.id.length).toBeGreaterThan(0);
    });

    it('should create two customers with different IDs when id is not provided', () => {
      const customer1 = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
      });

      const customer2 = CustomerFactory.create({
        documentType: DocumentType.CNPJ,
        documentNumber: '11222333000181',
        name: 'Jane Doe Inc',
      });

      expect(customer1.id).not.toBe(customer2.id);
    });

    it('should clean up document number by removing non-numeric characters', () => {
      const documentNumber = '111.444.777-35';

      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber,
        name: 'John Doe',
      });

      expect(customer.document.value).toBe('11144477735');
    });

    it('should create customer with email when provided', () => {
      const email = 'test@example.com';

      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
        email,
      });

      expect(customer.email).toBeDefined();
      expect(customer.email?.value).toBe(email);
    });

    it('should create customer without email when not provided', () => {
      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
      });

      expect(customer.email).toBeUndefined();
    });

    it('should throw an error when document number is invalid', () => {
      expect(() => {
        CustomerFactory.create({
          documentType: DocumentType.CPF,
          documentNumber: '00000000000',
          name: 'John Doe',
        });
      }).toThrow();
    });

    it('should throw an error when email is invalid', () => {
      expect(() => {
        CustomerFactory.create({
          documentType: DocumentType.CPF,
          documentNumber: '12345678901',
          name: 'John Doe',
          email: 'invalid-email',
        });
      }).toThrow();
    });

    it('should create customer with deletedAt when provided', () => {
      const deletedAt = new Date('2024-01-03');

      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
        deletedAt,
      });

      expect(customer.deletedAt).toBe(deletedAt);
      expect(customer.isArchived()).toBe(true);
    });

    it('should support CNPJ document type', () => {
      const customer = CustomerFactory.create({
        documentType: DocumentType.CNPJ,
        documentNumber: '11222333000181',
        name: 'Company Inc',
      });

      expect(customer.document.type).toBe(DocumentType.CNPJ);
      expect(customer.document.value).toBe('11222333000181');
    });

    it('should set default dates when not provided', () => {
      const customer = CustomerFactory.create({
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
      });

      expect(customer.createdAt).toBeInstanceOf(Date);
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });
  });
});
