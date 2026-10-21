import CreateCustomerUseCase from './create-customer.usecase';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import CustomerRegistrationChecker from '@/customer-management/domain/services/customer-registration-checker.service';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';
import Customer from '@customer-management/domain/entities/customer.entity';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let customerRepositoryMock: jest.Mocked<CustomerRepositoryInterface>;
  let registrationCheckerMock: jest.Mocked<CustomerRegistrationChecker>;

  beforeEach(() => {
    customerRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    } as any;

    registrationCheckerMock = {
      checkUniqueness: jest.fn(),
    } as any;

    useCase = new CreateCustomerUseCase(
      customerRepositoryMock,
      registrationCheckerMock,
    );
  });

  describe('execute', () => {
    it('should create a customer successfully', async () => {
      const input = {
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      };

      const result = await useCase.execute(input);

      expect(result.customer).toBeDefined();
      expect(result.customer.name).toBe('John Doe');
      expect(result.customer.documentNumber).toBe('11144477735');
      expect(result.customer.email).toBe('john@example.com');
      expect(result.customer.phone).toBe('11999999999');
      expect(registrationCheckerMock.checkUniqueness).toHaveBeenCalled();
      expect(customerRepositoryMock.create).toHaveBeenCalled();
    });

    it('should check uniqueness of customer document before creating', async () => {
      const input = {
        documentType: DocumentType.CNPJ,
        documentNumber: '11222333000181',
        name: 'Company Inc',
        email: 'company@example.com',
        phone: '1133333333',
      };

      await useCase.execute(input);

      expect(registrationCheckerMock.checkUniqueness).toHaveBeenCalled();
    });

    it('should save the customer in the repository', async () => {
      const input = {
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '11988888888',
      };

      await useCase.execute(input);

      expect(customerRepositoryMock.create).toHaveBeenCalledWith(
        expect.any(Customer),
      );
    });

    it('should return customer output DTO with correct properties', async () => {
      const input = {
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '11912345678',
      };

      const result = await useCase.execute(input);

      expect(result.customer.id).toBeDefined();
      expect(result.customer.documentType).toBe(DocumentType.CPF);
      expect(result.customer.name).toBe('Test Customer');
      expect(result.customer.createdAt).toBeDefined();
    });

    it('should throw error if document is not unique', async () => {
      const input = {
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '11999999999',
      };

      const error = new Error('Document already exists');
      registrationCheckerMock.checkUniqueness.mockRejectedValue(error);

      await expect(useCase.execute(input)).rejects.toThrow(
        'Document already exists',
      );
    });

    it('should create customer with all required fields', async () => {
      const input = {
        documentType: DocumentType.CPF,
        documentNumber: '11144477735',
        name: 'Complete Customer',
        email: 'complete@example.com',
        phone: '11987654321',
      };

      const result = await useCase.execute(input);

      expect(result.customer).toHaveProperty('id');
      expect(result.customer).toHaveProperty('documentType');
      expect(result.customer).toHaveProperty('documentNumber');
      expect(result.customer).toHaveProperty('name');
      expect(result.customer).toHaveProperty('email');
      expect(result.customer).toHaveProperty('phone');
      expect(result.customer).toHaveProperty('createdAt');
    });
  });
});
