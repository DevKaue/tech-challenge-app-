import CustomerRegistrationChecker from './customer-registration-checker.service';
import CustomerRepositoryInterface from '../contracts/customer-repository.interface';
import Document from '../value-objects/document.vo';
import { DocumentType } from '../enums/document-type.enum';
import Customer from '../entities/customer.entity';
import CustomerAlreadyExistsException from '../exceptions/customer-already-exists.exception';
import CustomerIsArchivedException from '../exceptions/customer-is-archived.exception';

describe('CustomerRegistrationChecker Service', () => {
  let service: CustomerRegistrationChecker;
  let mockCustomerRepository: jest.Mocked<CustomerRepositoryInterface>;

  beforeEach(() => {
    mockCustomerRepository = {
      findById: jest.fn(),
      getById: jest.fn(),
      findByDocument: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    };

    service = new CustomerRegistrationChecker(mockCustomerRepository);
  });

  describe('checkUniqueness', () => {
    it('should allow registration when customer does not exist', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');
      mockCustomerRepository.findByDocument.mockResolvedValueOnce(null);

      await expect(service.checkUniqueness(document)).resolves.not.toThrow();
      expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
        document,
        {
          includeDeleted: true,
        },
      );
    });

    it('should throw CustomerAlreadyExistsException when customer exists and is not archived', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');
      const existingCustomer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });

      mockCustomerRepository.findByDocument.mockResolvedValueOnce(
        existingCustomer,
      );

      await expect(service.checkUniqueness(document)).rejects.toThrow(
        CustomerAlreadyExistsException,
      );
      expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
        document,
        {
          includeDeleted: true,
        },
      );
    });

    it('should throw CustomerIsArchivedException when customer exists and is archived', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');
      const archivedCustomer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        deletedAt: new Date(),
      });

      mockCustomerRepository.findByDocument.mockResolvedValueOnce(
        archivedCustomer,
      );

      await expect(service.checkUniqueness(document)).rejects.toThrow(
        CustomerIsArchivedException,
      );
      expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
        document,
        {
          includeDeleted: true,
        },
      );
    });

    it('should call repository with includeDeleted flag', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');
      mockCustomerRepository.findByDocument.mockResolvedValueOnce(null);

      await service.checkUniqueness(document);

      expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
        document,
        {
          includeDeleted: true,
        },
      );
    });

    it('should verify repository is called with the correct document instance', async () => {
      const document = new Document(DocumentType.CNPJ, '11222333000181');
      mockCustomerRepository.findByDocument.mockResolvedValueOnce(null);

      await service.checkUniqueness(document);

      expect(mockCustomerRepository.findByDocument).toHaveBeenCalledWith(
        document,
        {
          includeDeleted: true,
        },
      );
    });

    it('should handle repository errors', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');
      const error = new Error('Database error');
      mockCustomerRepository.findByDocument.mockRejectedValueOnce(error);

      await expect(service.checkUniqueness(document)).rejects.toThrow(
        'Database error',
      );
    });

    it('should properly distinguish between active and archived customers', async () => {
      const document = new Document(DocumentType.CPF, '11144477735');

      // First call: return active customer
      const activeCustomer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
      });
      mockCustomerRepository.findByDocument.mockResolvedValueOnce(
        activeCustomer,
      );

      await expect(service.checkUniqueness(document)).rejects.toThrow(
        CustomerAlreadyExistsException,
      );

      // Reset mock
      mockCustomerRepository.findByDocument.mockReset();

      // Second call: return archived customer
      const archivedCustomer = new Customer({
        id: 'customer-123',
        document,
        name: 'John Doe',
        deletedAt: new Date(),
      });
      mockCustomerRepository.findByDocument.mockResolvedValueOnce(
        archivedCustomer,
      );

      await expect(service.checkUniqueness(document)).rejects.toThrow(
        CustomerIsArchivedException,
      );
    });
  });
});
