import FindVehicleByIdUseCase from './find-vehicle-by-id.usecase';
import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

describe('FindVehicleByIdUseCase', () => {
  let useCase: FindVehicleByIdUseCase;
  let vehicleQueryServiceMock: jest.Mocked<VehicleQueryServiceInterface>;

  beforeEach(() => {
    vehicleQueryServiceMock = {
      getById: jest.fn(),
      list: jest.fn(),
    } as any;

    useCase = new FindVehicleByIdUseCase(vehicleQueryServiceMock);
  });

  describe('execute', () => {
    it('should find a vehicle by id successfully', async () => {
      const input = { id: 'vehicle-123' };

      const vehicleDTO = {
        id: 'vehicle-123',
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'customer-123',
        createdAt: new Date('2024-01-01'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      const result = await useCase.execute(input);

      expect(result.vehicle).toEqual(vehicleDTO);
      expect(result.vehicle.id).toBe('vehicle-123');
      expect(result.vehicle.licensePlate).toBe('ABC1234');
      expect(result.vehicle.brand).toBe('Toyota');
    });

    it('should call query service with correct id', async () => {
      const vehicleId = 'vehicle-456';
      const input = { id: vehicleId };

      const vehicleDTO = {
        id: vehicleId,
        licensePlate: 'XYZ9876',
        brand: 'Honda',
        model: 'Civic',
        year: 2023,
        customerId: 'customer-456',
        createdAt: new Date('2024-01-15'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      await useCase.execute(input);

      expect(vehicleQueryServiceMock.getById).toHaveBeenCalledWith({
        id: vehicleId,
      });
    });

    it('should return output DTO with vehicle data', async () => {
      const input = { id: 'vehicle-789' };

      const vehicleDTO = {
        id: 'vehicle-789',
        licensePlate: 'DEF5678',
        brand: 'Volkswagen',
        model: 'Golf',
        year: 2021,
        customerId: 'customer-789',
        createdAt: new Date('2024-02-01'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      const result = await useCase.execute(input);

      expect(result.vehicle.id).toBe('vehicle-789');
      expect(result.vehicle.licensePlate).toBe('DEF5678');
      expect(result.vehicle.brand).toBe('Volkswagen');
      expect(result.vehicle.model).toBe('Golf');
      expect(result.vehicle.year).toBe(2021);
      expect(result.vehicle.customerId).toBe('customer-789');
    });

    it('should throw VehicleNotFoundException when vehicle does not exist', async () => {
      const input = { id: 'non-existent-id' };

      vehicleQueryServiceMock.getById.mockRejectedValue(
        new VehicleNotFoundException(),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        VehicleNotFoundException,
      );
    });

    it('should return vehicle with all properties', async () => {
      const input = { id: 'vehicle-complete' };

      const vehicleDTO = {
        id: 'vehicle-complete',
        licensePlate: 'GHI2468',
        brand: 'BMW',
        model: '320i',
        year: 2024,
        customerId: 'customer-complete',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-05'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      const result = await useCase.execute(input);

      expect(result.vehicle).toEqual(vehicleDTO);
      expect(result.vehicle.id).toBeDefined();
      expect(result.vehicle.licensePlate).toBeDefined();
      expect(result.vehicle.brand).toBeDefined();
      expect(result.vehicle.model).toBeDefined();
      expect(result.vehicle.year).toBeDefined();
      expect(result.vehicle.customerId).toBeDefined();
      expect(result.vehicle.createdAt).toBeDefined();
    });

    it('should handle vehicle with minimal properties', async () => {
      const input = { id: 'vehicle-minimal' };

      const vehicleDTO = {
        id: 'vehicle-minimal',
        licensePlate: 'JKL3579',
        brand: 'Fiat',
        model: 'Uno',
        year: 2020,
        customerId: 'customer-minimal',
        createdAt: new Date('2024-04-01'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      const result = await useCase.execute(input);

      expect(result.vehicle.id).toBe('vehicle-minimal');
      expect(result.vehicle.licensePlate).toBe('JKL3579');
      expect(result.vehicle.createdAt).toBeDefined();
      expect(result.vehicle.updatedAt).toBeUndefined();
    });

    it('should handle different vehicle brands and models', async () => {
      const input = { id: 'vehicle-luxury' };

      const vehicleDTO = {
        id: 'vehicle-luxury',
        licensePlate: 'MNO4680',
        brand: 'Mercedes-Benz',
        model: 'C-Class',
        year: 2024,
        customerId: 'customer-luxury',
        createdAt: new Date('2024-05-01'),
      };

      vehicleQueryServiceMock.getById.mockResolvedValue(vehicleDTO);

      const result = await useCase.execute(input);

      expect(result.vehicle.brand).toBe('Mercedes-Benz');
      expect(result.vehicle.model).toBe('C-Class');
      expect(result.vehicle.year).toBe(2024);
    });
  });
});
