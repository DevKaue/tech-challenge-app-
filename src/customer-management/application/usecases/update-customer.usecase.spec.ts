import UpdateCustomerUseCase from './update-customer.usecase';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import Customer from '@customer-management/domain/entities/customer.entity';
import Document from '@customer-management/domain/value-objects/document.vo';
import Email from '@customer-management/domain/value-objects/email.vo';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;
  let customerRepositoryMock: jest.Mocked<CustomerRepositoryInterface>;

  beforeEach(() => {
    customerRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    } as any;

    useCase = new UpdateCustomerUseCase(customerRepositoryMock);
  });

  describe('execute', () => {
    it('should update customer name successfully', async () => {
      const input = {
        id: 'customer-123',
        name: 'Jane Doe Updated',
      };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Jane Doe',
        phone: '11999999999',
        email: new Email('jane@example.com'),
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('customer');
      expect(result.customer).toBeDefined();
      expect(customerRepositoryMock.update).toHaveBeenCalledWith(customer);
    });

    it('should update customer phone successfully', async () => {
      const input = {
        id: 'customer-456',
        phone: '11988888888',
      };

      const customer = new Customer({
        id: 'customer-456',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
        phone: '11999999999',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('customer');
      expect(result.customer).toBeDefined();
      expect(customerRepositoryMock.update).toHaveBeenCalledWith(customer);
    });

    it('should update customer email successfully', async () => {
      const input = {
        id: 'customer-789',
        email: 'newemail@example.com',
      };

      const customer = new Customer({
        id: 'customer-789',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Test Customer',
        email: new Email('old@example.com'),
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('customer');
      expect(result.customer).toBeDefined();
      expect(customerRepositoryMock.update).toHaveBeenCalledWith(customer);
    });

    it('should update multiple customer fields', async () => {
      const input = {
        id: 'customer-complete',
        name: 'New Name',
        phone: '11987654321',
        email: 'updated@example.com',
      };

      const customer = new Customer({
        id: 'customer-complete',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Old Name',
        phone: '11999999999',
        email: new Email('old@example.com'),
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('customer');
      expect(result.customer).toBeDefined();
      expect(customerRepositoryMock.update).toHaveBeenCalledWith(customer);
    });

    it('should not update fields when they are undefined', async () => {
      const input = {
        id: 'customer-partial',
        name: 'Updated Name',
      };

      const customer = new Customer({
        id: 'customer-partial',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Original Name',
        phone: '11999999999',
        email: new Email('email@example.com'),
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(customerRepositoryMock.update).toHaveBeenCalled();
    });

    it('should clear email when null is provided', async () => {
      const input = {
        id: 'customer-remove-email',
        email: null,
      };

      const customer = new Customer({
        id: 'customer-remove-email',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Test Customer',
        email: new Email('email@example.com'),
      });

      const changeEmailSpy = jest.spyOn(customer, 'changeEmail');
      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(changeEmailSpy).toHaveBeenCalled();
      expect(customerRepositoryMock.update).toHaveBeenCalledWith(customer);
    });

    it('should clear phone when undefined is provided', async () => {
      const input = {
        id: 'customer-remove-phone',
        phone: undefined,
      };

      const customer = new Customer({
        id: 'customer-remove-phone',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Test Customer',
        phone: '11999999999',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(customerRepositoryMock.update).toHaveBeenCalled();
    });

    it('should fetch customer from repository before updating', async () => {
      const customerId = 'customer-fetch-test';
      const input = {
        id: customerId,
        name: 'New Name',
      };

      const customer = new Customer({
        id: customerId,
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Old Name',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(customerRepositoryMock.getById).toHaveBeenCalledWith(customerId);
    });

    it('should return updated customer DTO', async () => {
      const input = {
        id: 'customer-return-test',
        name: 'Updated Name',
        phone: '11912345678',
        email: 'updated@test.com',
      };

      const customer = new Customer({
        id: 'customer-return-test',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Old Name',
        phone: '11999999999',
        email: new Email('old@test.com'),
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('customer');
      expect(result.customer.id).toBe(customer.id);
      expect(result.customer.documentType).toBe(customer.document.type);
    });
  });
});
