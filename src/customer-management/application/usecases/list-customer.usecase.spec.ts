import ListCustomerUseCase from './list-customer.usecase';
import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

describe('ListCustomerUseCase', () => {
  let useCase: ListCustomerUseCase;
  let customerQueryServiceMock: jest.Mocked<CustomerQueryServiceInterface>;

  beforeEach(() => {
    customerQueryServiceMock = {
      getById: jest.fn(),
      list: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new ListCustomerUseCase(customerQueryServiceMock);
  });

  describe('execute', () => {
    it('should list all customers successfully', async () => {
      const customersDTO = [
        {
          id: 'customer-1',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'John Doe',
          email: 'john@example.com',
          phone: '11999999999',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'customer-2',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '11988888888',
          createdAt: new Date('2024-01-02'),
        },
      ];

      customerQueryServiceMock.findAll.mockResolvedValue(customersDTO);

      const result = await useCase.execute();

      expect(result).toHaveProperty('customers');
      expect(result.customers).toBeDefined();
      expect(result.customers).toHaveLength(2);
      expect(result.customers[0].name).toBe('John Doe');
      expect(result.customers[1].name).toBe('Jane Smith');
    });

    it('should return empty list when no customers exist', async () => {
      customerQueryServiceMock.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toHaveProperty('customers');
      expect(result.customers).toBeDefined();
      expect(result.customers).toHaveLength(0);
    });

    it('should call query service to find all customers', async () => {
      const customersDTO = [
        {
          id: 'customer-123',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Test Customer',
          createdAt: new Date(),
        },
      ];

      customerQueryServiceMock.findAll.mockResolvedValue(customersDTO);

      await useCase.execute();

      expect(customerQueryServiceMock.findAll).toHaveBeenCalled();
    });

    it('should return customers with all properties', async () => {
      const customersDTO = [
        {
          id: 'customer-complete',
          documentType: DocumentType.CNPJ,
          documentNumber: '11222333000181',
          name: 'Complete Customer',
          email: 'complete@example.com',
          phone: '1133333333',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-05'),
        },
      ];

      customerQueryServiceMock.findAll.mockResolvedValue(customersDTO);

      const result = await useCase.execute();

      expect(result.customers).toHaveLength(1);
      expect(result.customers[0].id).toBe('customer-complete');
      expect(result.customers[0].documentType).toBe(DocumentType.CNPJ);
      expect(result.customers[0].documentNumber).toBe('11222333000181');
      expect(result.customers[0].name).toBe('Complete Customer');
      expect(result.customers[0].email).toBe('complete@example.com');
      expect(result.customers[0].phone).toBe('1133333333');
      expect(result.customers[0].createdAt).toBeDefined();
      expect(result.customers[0].updatedAt).toBeDefined();
    });

    it('should handle customers with optional fields missing', async () => {
      const customersDTO = [
        {
          id: 'customer-minimal',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Minimal Customer',
          createdAt: new Date(),
        },
      ];

      customerQueryServiceMock.findAll.mockResolvedValue(customersDTO);

      const result = await useCase.execute();

      expect(result.customers).toHaveLength(1);
      expect(result.customers[0].id).toBe('customer-minimal');
      expect(result.customers[0].name).toBe('Minimal Customer');
      expect(result.customers[0].email).toBeUndefined();
      expect(result.customers[0].phone).toBeUndefined();
    });

    it('should return multiple customers in correct order', async () => {
      const customersDTO = [
        {
          id: 'customer-1',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Alice',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'customer-2',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Bob',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'customer-3',
          documentType: DocumentType.CPF,
          documentNumber: '11144477735',
          name: 'Charlie',
          createdAt: new Date('2024-01-03'),
        },
      ];

      customerQueryServiceMock.findAll.mockResolvedValue(customersDTO);

      const result = await useCase.execute();

      expect(result.customers).toHaveLength(3);
      expect(result.customers[0].name).toBe('Alice');
      expect(result.customers[1].name).toBe('Bob');
      expect(result.customers[2].name).toBe('Charlie');
    });
  });
});
