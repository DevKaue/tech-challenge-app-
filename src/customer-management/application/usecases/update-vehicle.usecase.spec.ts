import UpdateVehicleUseCase from './update-vehicle.usecase';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import VehicleRegistrationChecker from '@/customer-management/domain/services/vehicle-registration-checker.service';
import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';

describe('UpdateVehicleUseCase', () => {
  let useCase: UpdateVehicleUseCase;
  let vehicleRepositoryMock: jest.Mocked<VehicleRepositoryInterface>;
  let registrationCheckerMock: jest.Mocked<VehicleRegistrationChecker>;

  beforeEach(() => {
    vehicleRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      archiveAllByCustomerId: jest.fn(),
    } as any;

    registrationCheckerMock = {
      checkUniqueness: jest.fn(),
    } as any;

    useCase = new UpdateVehicleUseCase(
      vehicleRepositoryMock,
      registrationCheckerMock,
    );
  });

  describe('execute', () => {
    it('should update vehicle license plate successfully', async () => {
      const input = {
        id: 'vehicle-123',
        licensePlate: 'XYZ9876',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate: new LicensePlate('ABC1234'),
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2022),
        customerId: 'customer-123',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle).toBeDefined();
      expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(vehicle);
    });

    it('should check uniqueness when updating license plate', async () => {
      const input = {
        id: 'vehicle-456',
        licensePlate: 'NEW1234',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-456',
        licensePlate: new LicensePlate('OLD1234'),
        brand: 'Honda',
        model: 'Civic',
        year: new Year(2023),
        customerId: 'customer-456',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(registrationCheckerMock.checkUniqueness).toHaveBeenCalled();
    });

    it('should not check uniqueness when license plate is not updated', async () => {
      const input = {
        id: 'vehicle-789',
        brand: 'Volkswagen',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-789',
        licensePlate: new LicensePlate('VWG1234'),
        brand: 'Honda',
        model: 'Golf',
        year: new Year(2021),
        customerId: 'customer-789',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(registrationCheckerMock.checkUniqueness).not.toHaveBeenCalled();
    });

    it('should update vehicle brand successfully', async () => {
      const input = {
        id: 'vehicle-brand-update',
        brand: 'BMW',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-brand-update',
        licensePlate: new LicensePlate('BMW1234'),
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2022),
        customerId: 'customer-123',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle).toBeDefined();
      expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(vehicle);
    });

    it('should update vehicle model successfully', async () => {
      const input = {
        id: 'vehicle-model-update',
        model: 'Civic EX',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-model-update',
        licensePlate: new LicensePlate('MOD1234'),
        brand: 'Honda',
        model: 'Civic',
        year: new Year(2023),
        customerId: 'customer-456',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle).toBeDefined();
      expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(vehicle);
    });

    it('should update vehicle year successfully', async () => {
      const input = {
        id: 'vehicle-year-update',
        year: 2024,
      };

      const vehicle = new Vehicle({
        id: 'vehicle-year-update',
        licensePlate: new LicensePlate('YEA1234'),
        brand: 'Mercedes',
        model: 'C-Class',
        year: new Year(2023),
        customerId: 'customer-789',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle).toBeDefined();
      expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(vehicle);
    });

    it('should update multiple vehicle fields', async () => {
      const input = {
        id: 'vehicle-multiple-update',
        licensePlate: 'MUL1234',
        brand: 'Audi',
        model: 'A4',
        year: 2024,
      };

      const vehicle = new Vehicle({
        id: 'vehicle-multiple-update',
        licensePlate: new LicensePlate('OLD1234'),
        brand: 'Volkswagen',
        model: 'Golf',
        year: new Year(2021),
        customerId: 'customer-complete',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle).toBeDefined();
      expect(vehicleRepositoryMock.update).toHaveBeenCalledWith(vehicle);
    });

    it('should not update fields when they are undefined', async () => {
      const input = {
        id: 'vehicle-partial-update',
        brand: 'Fiat',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-partial-update',
        licensePlate: new LicensePlate('FIA1234'),
        brand: 'Peugeot',
        model: 'Uno',
        year: new Year(2020),
        customerId: 'customer-456',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.update).toHaveBeenCalled();
    });

    it('should fetch vehicle from repository before updating', async () => {
      const vehicleId = 'vehicle-fetch-test';
      const input = {
        id: vehicleId,
        brand: 'Suzuki',
      };

      const vehicle = new Vehicle({
        id: vehicleId,
        licensePlate: new LicensePlate('SUZ1234'),
        brand: 'Maruti',
        model: 'Swift',
        year: new Year(2022),
        customerId: 'customer-123',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.getById).toHaveBeenCalledWith(vehicleId);
    });

    it('should return updated vehicle DTO', async () => {
      const input = {
        id: 'vehicle-return-test',
        brand: 'Hyundai',
        model: 'Elantra',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-return-test',
        licensePlate: new LicensePlate('HYU1234'),
        brand: 'Kia',
        model: 'Forte',
        year: new Year(2023),
        customerId: 'customer-789',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      const result = await useCase.execute(input);

      expect(result).toHaveProperty('vehicle');
      expect(result.vehicle.id).toBe(vehicle.id);
      expect(result.vehicle.licensePlate).toBe(vehicle.licensePlate.value);
    });

    it('should throw error if license plate already exists', async () => {
      const input = {
        id: 'vehicle-error-test',
        licensePlate: 'EXI1234',
      };

      const vehicle = new Vehicle({
        id: 'vehicle-error-test',
        licensePlate: new LicensePlate('OLD1234'),
        brand: 'Mitsubishi',
        model: 'Lancer',
        year: new Year(2022),
        customerId: 'customer-456',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);
      const error = new Error('License plate already exists');
      registrationCheckerMock.checkUniqueness.mockRejectedValue(error);

      await expect(useCase.execute(input)).rejects.toThrow(
        'License plate already exists',
      );
    });
  });
});
