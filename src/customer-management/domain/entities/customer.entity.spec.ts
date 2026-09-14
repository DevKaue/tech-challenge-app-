import Customer from './customer.entity';
import Document from '../value-objects/document.vo';
import Email from '../value-objects/email.vo';
import { DocumentType } from '../enums/document-type.enum';

describe('Customer Entity', () => {
  let document: Document;
  let email: Email;

  beforeEach(() => {
    document = new Document(DocumentType.CPF, '11144477735');
    email = new Email('test@example.com');
  });

  describe('Constructor', () => {
    it('should create a customer with all properties', () => {
      const customerId = 'customer-123';
      const name = 'John Doe';
      const phone = '11999999999';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const customer = new Customer({
        id: customerId,
        document,
        name,
        phone,
        email,
        createdAt,
        updatedAt,
      });

      expect(customer.id).toBe(customerId);
      expect(customer.document).toBe(document);
      expect(customer.name).toBe(name);
      expect(customer.phone).toBe(phone);
      expect(customer.email).toBe(email);
      expect(customer.createdAt).toBe(createdAt);
      expect(customer.updatedAt).toBe(updatedAt);
    });

    it('should create a customer without optional properties', () => {
      const customerId = 'customer-123';
      const name = 'John Doe';

      const customer = new Customer({
        id: customerId,
        document,
        name,
      });

      expect(customer.id).toBe(customerId);
      expect(customer.document).toBe(document);
      expect(customer.name).toBe(name);
      expect(customer.phone).toBeUndefined();
      expect(customer.email).toBeUndefined();
      expect(customer.deletedAt).toBeUndefined();
    });

    it('should set default dates if not provided', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      expect(customer.createdAt).toBeInstanceOf(Date);
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });

    it('should initialize with deletedAt as undefined', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      expect(customer.deletedAt).toBeUndefined();
    });
  });

  describe('Getters', () => {
    let customer: Customer;

    beforeEach(() => {
      customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        phone: '11999999999',
        email,
      });
    });

    it('should return id', () => {
      expect(customer.id).toBe('customer-123');
    });

    it('should return document', () => {
      expect(customer.document).toBe(document);
    });

    it('should return name', () => {
      expect(customer.name).toBe('John Doe');
    });

    it('should return phone', () => {
      expect(customer.phone).toBe('11999999999');
    });

    it('should return email', () => {
      expect(customer.email).toBe(email);
    });

    it('should return createdAt', () => {
      expect(customer.createdAt).toBeInstanceOf(Date);
    });

    it('should return updatedAt', () => {
      expect(customer.updatedAt).toBeInstanceOf(Date);
    });

    it('should return deletedAt', () => {
      expect(customer.deletedAt).toBeUndefined();
    });
  });

  describe('isArchived', () => {
    it('should return false when customer is not archived', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      expect(customer.isArchived()).toBe(false);
    });

    it('should return true when customer is archived', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        deletedAt: new Date(),
      });

      expect(customer.isArchived()).toBe(true);
    });
  });

  describe('changeName', () => {
    it('should change customer name', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      const previousUpdatedAt = customer.updatedAt;

      customer.changeName('Jane Doe');

      expect(customer.name).toBe('Jane Doe');
      expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });

    it('should update updatedAt when changing name', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = customer.updatedAt;

      customer.changeName('Jane Doe');

      expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('changePhone', () => {
    it('should change customer phone', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        phone: '11999999999',
      });

      customer.changePhone('11988888888');

      expect(customer.phone).toBe('11988888888');
    });

    it('should set phone to undefined', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        phone: '11999999999',
      });

      customer.changePhone(undefined);

      expect(customer.phone).toBeUndefined();
    });

    it('should update updatedAt when changing phone', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        phone: '11999999999',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = customer.updatedAt;

      customer.changePhone('11988888888');

      expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('changeEmail', () => {
    it('should change customer email', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        email,
      });

      const newEmail = new Email('newemail@example.com');
      customer.changeEmail(newEmail);

      expect(customer.email).toBe(newEmail);
    });

    it('should set email to undefined', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        email,
      });

      customer.changeEmail(undefined);

      expect(customer.email).toBeUndefined();
    });

    it('should update updatedAt when changing email', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        email,
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = customer.updatedAt;
      const newEmail = new Email('newemail@example.com');

      customer.changeEmail(newEmail);

      expect(customer.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a customer', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      expect(customer.deletedAt).toBeUndefined();
      expect(customer.isArchived()).toBe(false);

      customer.softDelete();

      expect(customer.deletedAt).toBeInstanceOf(Date);
      expect(customer.isArchived()).toBe(true);
    });

    it('should update deletedAt timestamp when soft deleting', () => {
      const customer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      const beforeDelete = new Date();
      customer.softDelete();
      const afterDelete = new Date();

      expect(customer.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime(),
      );
      expect(customer.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterDelete.getTime(),
      );
    });
  });
});
