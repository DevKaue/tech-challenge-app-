import ArchiveCustomerUseCase from './archive-customer.usecase';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import UnitOfWorkServiceInterface from '@customer-management/application/contracts/unit-of-work-service.interface';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';
import Customer from '@customer-management/domain/entities/customer.entity';
import Document from '@customer-management/domain/value-objects/document.vo';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

describe('ArchiveCustomerUseCase', () => {
  let useCase: ArchiveCustomerUseCase;
  let customerRepositoryMock: jest.Mocked<CustomerRepositoryInterface>;
  let vehicleRepositoryMock: jest.Mocked<VehicleRepositoryInterface>;
  let unitOfWorkMock: jest.Mocked<UnitOfWorkServiceInterface>;

  beforeEach(() => {
    customerRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    } as any;

    vehicleRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      archiveAllByCustomerId: jest.fn(),
    } as any;

    unitOfWorkMock = {
      runInTransaction: jest.fn((callback) => callback()),
    } as any;

    useCase = new ArchiveCustomerUseCase(
      customerRepositoryMock,
      vehicleRepositoryMock,
      unitOfWorkMock,
    );
  });

  describe('execute', () => {
    it('should archive a customer successfully', async () => {
      const input = { id: 'customer-123' };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
        phone: '11999999999',
        email: undefined,
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(customerRepositoryMock.getById).toHaveBeenCalledWith(input.id);
      expect(customerRepositoryMock.archive).toHaveBeenCalledWith(customer);
      expect(vehicleRepositoryMock.archiveAllByCustomerId).toHaveBeenCalledWith(
        input.id,
      );
      expect(unitOfWorkMock.runInTransaction).toHaveBeenCalled();
    });

    it('should soft delete the customer before archiving', async () => {
      const input = { id: 'customer-123' };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      const softDeleteSpy = jest.spyOn(customer, 'softDelete');
      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(softDeleteSpy).toHaveBeenCalled();
    });

    it('should archive all vehicles for the customer', async () => {
      const customerId = 'customer-123';
      const input = { id: customerId };

      const customer = new Customer({
        id: customerId,
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.archiveAllByCustomerId).toHaveBeenCalledWith(
        customerId,
      );
    });

    it('should throw CustomerNotFoundException when customer does not exist', async () => {
      const input = { id: 'non-existent-id' };

      customerRepositoryMock.getById.mockRejectedValue(
        new CustomerNotFoundException(),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        CustomerNotFoundException,
      );
    });

    it('should run archive in a transaction', async () => {
      const input = { id: 'customer-123' };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(unitOfWorkMock.runInTransaction).toHaveBeenCalled();
    });
  });
});
