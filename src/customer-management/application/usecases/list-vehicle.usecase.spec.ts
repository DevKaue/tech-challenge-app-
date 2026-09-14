import ListVehicleUseCase from './list-vehicle.usecase';
import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';

describe('ListVehicleUseCase', () => {
  let useCase: ListVehicleUseCase;
  let vehicleQueryServiceMock: jest.Mocked<VehicleQueryServiceInterface>;

  beforeEach(() => {
    vehicleQueryServiceMock = {
      getById: jest.fn(),
      list: jest.fn(),
      findAll: jest.fn(),
    } as any;

    useCase = new ListVehicleUseCase(vehicleQueryServiceMock);
  });

  describe('execute', () => {
    it('should list all vehicles successfully', async () => {
      const input = {
        customerId: 'customer-123',
      };

      const vehiclesDTO = [
        {
          id: 'vehicle-1',
          licensePlate: 'ABC1234',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2022,
          customerId: 'customer-123',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'vehicle-2',
          licensePlate: 'XYZ9876',
          brand: 'Honda',
          model: 'Civic',
          year: 2023,
          customerId: 'customer-123',
          createdAt: new Date('2024-01-02'),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicles');
      expect(result.vehicles).toBeDefined();
      expect(result.vehicles).toHaveLength(2);
      expect(result.vehicles[0].licensePlate).toBe('ABC1234');
      expect(result.vehicles[1].licensePlate).toBe('XYZ9876');
    });

    it('should filter vehicles by customer id', async () => {
      const customerId = 'customer-456';
      const input = {
        customerId,
      };

      const vehiclesDTO = [
        {
          id: 'vehicle-3',
          licensePlate: 'DEF5678',
          brand: 'Volkswagen',
          model: 'Golf',
          year: 2021,
          customerId,
          createdAt: new Date(),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(vehicleQueryServiceMock.findAll).toHaveBeenCalledWith({
        customerId,
      });
      expect(result.vehicles).toHaveLength(1);
      expect(result.vehicles[0].customerId).toBe(customerId);
    });

    it('should return empty list when no vehicles exist for customer', async () => {
      const input = {
        customerId: 'customer-no-vehicles',
      };

      vehicleQueryServiceMock.findAll.mockResolvedValue([]);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicles');
      expect(result.vehicles).toBeDefined();
      expect(result.vehicles).toHaveLength(0);
    });

    it('should list vehicles without customer id filter', async () => {
      const input = {};

      const vehiclesDTO = [
        {
          id: 'vehicle-all-1',
          licensePlate: 'AAA1111',
          brand: 'BMW',
          model: '320i',
          year: 2024,
          customerId: 'customer-1',
          createdAt: new Date(),
        },
        {
          id: 'vehicle-all-2',
          licensePlate: 'BBB2222',
          brand: 'Mercedes',
          model: 'C-Class',
          year: 2024,
          customerId: 'customer-2',
          createdAt: new Date(),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(vehicleQueryServiceMock.findAll).toHaveBeenCalledWith({
        customerId: undefined,
      });
      expect(result.vehicles).toHaveLength(2);
    });

    it('should return vehicles with all properties', async () => {
      const input = {
        customerId: 'customer-123',
      };

      const vehiclesDTO = [
        {
          id: 'vehicle-complete',
          licensePlate: 'GHI2468',
          brand: 'Audi',
          model: 'A4',
          year: 2024,
          customerId: 'customer-123',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-05'),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(result.vehicles).toHaveLength(1);
      const vehicle = result.vehicles[0];
      expect(vehicle.id).toBe('vehicle-complete');
      expect(vehicle.licensePlate).toBe('GHI2468');
      expect(vehicle.brand).toBe('Audi');
      expect(vehicle.model).toBe('A4');
      expect(vehicle.year).toBe(2024);
      expect(vehicle.customerId).toBe('customer-123');
      expect(vehicle.createdAt).toBeDefined();
      expect(vehicle.updatedAt).toBeDefined();
    });

    it('should handle vehicles with minimal properties', async () => {
      const input = {
        customerId: 'customer-456',
      };

      const vehiclesDTO = [
        {
          id: 'vehicle-minimal',
          licensePlate: 'JKL3579',
          brand: 'Fiat',
          model: 'Uno',
          year: 2020,
          customerId: 'customer-456',
          createdAt: new Date(),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(result.vehicles).toHaveLength(1);
      const vehicle = result.vehicles[0];
      expect(vehicle.id).toBe('vehicle-minimal');
      expect(vehicle.licensePlate).toBe('JKL3579');
      expect(vehicle.createdAt).toBeDefined();
      expect(vehicle.updatedAt).toBeUndefined();
    });

    it('should return multiple vehicles in correct order', async () => {
      const input = {
        customerId: 'customer-multi',
      };

      const vehiclesDTO = [
        {
          id: 'vehicle-first',
          licensePlate: 'VEH1111',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2022,
          customerId: 'customer-multi',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'vehicle-second',
          licensePlate: 'VEH2222',
          brand: 'Honda',
          model: 'Civic',
          year: 2023,
          customerId: 'customer-multi',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'vehicle-third',
          licensePlate: 'VEH3333',
          brand: 'Volkswagen',
          model: 'Golf',
          year: 2024,
          customerId: 'customer-multi',
          createdAt: new Date('2024-01-03'),
        },
      ];

      vehicleQueryServiceMock.findAll.mockResolvedValue(vehiclesDTO);

      const result = await useCase.execute(input);

      expect(result.vehicles).toHaveLength(3);
      expect(result.vehicles[0].licensePlate).toBe('VEH1111');
      expect(result.vehicles[1].licensePlate).toBe('VEH2222');
      expect(result.vehicles[2].licensePlate).toBe('VEH3333');
    });
  });
});
