import { CreateVehicleUseCase } from './create-vehicle.usecase';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import CustomerRepositoryInterface from '@/customer-management/domain/contracts/customer-repository.interface';
import VehicleRegistrationChecker from '@/customer-management/domain/services/vehicle-registration-checker.service';
import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import Customer from '@customer-management/domain/entities/customer.entity';
import Document from '@customer-management/domain/value-objects/document.vo';
import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

describe('CreateVehicleUseCase', () => {
  let useCase: CreateVehicleUseCase;
  let vehicleRepositoryMock: jest.Mocked<VehicleRepositoryInterface>;
  let customerRepositoryMock: jest.Mocked<CustomerRepositoryInterface>;
  let registrationCheckerMock: jest.Mocked<VehicleRegistrationChecker>;

  beforeEach(() => {
    vehicleRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      archiveAllByCustomerId: jest.fn(),
    } as any;

    customerRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
    } as any;

    registrationCheckerMock = {
      checkUniqueness: jest.fn(),
    } as any;

    useCase = new CreateVehicleUseCase(
      vehicleRepositoryMock,
      customerRepositoryMock,
      registrationCheckerMock,
    );
  });

  describe('execute', () => {
    it('should create a vehicle successfully', async () => {
      const input = {
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'customer-123',
      };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result.vehicle).toBeDefined();
      expect(result.vehicle.licensePlate).toBe('ABC1234');
      expect(result.vehicle.brand).toBe('Toyota');
      expect(result.vehicle.model).toBe('Corolla');
      expect(result.vehicle.year).toBe(2022);
      expect(result.vehicle.customerId).toBe('customer-123');
    });

    it('should verify customer exists before creating vehicle', async () => {
      const input = {
        licensePlate: 'XYZ9876',
        brand: 'Honda',
        model: 'Civic',
        year: 2023,
        customerId: 'customer-456',
      };

      const customer = new Customer({
        id: 'customer-456',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Jane Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(customerRepositoryMock.getById).toHaveBeenCalledWith(
        input.customerId,
      );
    });

    it('should check uniqueness of license plate before creating', async () => {
      const input = {
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'customer-123',
      };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(registrationCheckerMock.checkUniqueness).toHaveBeenCalled();
    });

    it('should save the vehicle in the repository', async () => {
      const input = {
        licensePlate: 'DEF5678',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2021,
        customerId: 'customer-789',
      };

      const customer = new Customer({
        id: 'customer-789',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Test Customer',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.create).toHaveBeenCalledWith(
        expect.any(Vehicle),
      );
    });

    it('should throw error if customer does not exist', async () => {
      const input = {
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'non-existent-customer',
      };

      const error = new Error('Customer not found');
      customerRepositoryMock.getById.mockRejectedValue(error);

      await expect(useCase.execute(input)).rejects.toThrow(
        'Customer not found',
      );
    });

    it('should throw error if license plate is not unique', async () => {
      const input = {
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'customer-123',
      };

      const customer = new Customer({
        id: 'customer-123',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'John Doe',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);
      const error = new Error('License plate already registered');
      registrationCheckerMock.checkUniqueness.mockRejectedValue(error);

      await expect(useCase.execute(input)).rejects.toThrow(
        'License plate already registered',
      );
    });

    it('should return vehicle output DTO with correct properties', async () => {
      const input = {
        licensePlate: 'GHI2468',
        brand: 'BMW',
        model: '320i',
        year: 2024,
        customerId: 'customer-999',
      };

      const customer = new Customer({
        id: 'customer-999',
        document: new Document(DocumentType.CPF, '11144477735'),
        name: 'Premium Customer',
      });

      customerRepositoryMock.getById.mockResolvedValue(customer);

      const result = await useCase.execute(input);

      expect(result.vehicle.id).toBeDefined();
      expect(result.vehicle.licensePlate).toBe('GHI2468');
      expect(result.vehicle.brand).toBe('BMW');
      expect(result.vehicle.model).toBe('320i');
      expect(result.vehicle.year).toBe(2024);
      expect(result.vehicle.createdAt).toBeDefined();
    });
  });
});
