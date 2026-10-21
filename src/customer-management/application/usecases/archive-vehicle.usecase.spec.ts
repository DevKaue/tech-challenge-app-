import ArchiveVehicleUseCase from './archive-vehicle.usecase';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';
import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';

describe('ArchiveVehicleUseCase', () => {
  let useCase: ArchiveVehicleUseCase;
  let vehicleRepositoryMock: jest.Mocked<VehicleRepositoryInterface>;

  beforeEach(() => {
    vehicleRepositoryMock = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      archiveAllByCustomerId: jest.fn(),
    } as any;

    useCase = new ArchiveVehicleUseCase(vehicleRepositoryMock);
  });

  describe('execute', () => {
    it('should archive a vehicle successfully', async () => {
      const input = { id: 'vehicle-123' };

      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate: new LicensePlate('ABC1234'),
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2022),
        customerId: 'customer-123',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.getById).toHaveBeenCalledWith(input.id);
      expect(vehicleRepositoryMock.archive).toHaveBeenCalledWith(vehicle);
    });

    it('should soft delete the vehicle before archiving', async () => {
      const input = { id: 'vehicle-123' };

      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate: new LicensePlate('ABC1234'),
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2022),
        customerId: 'customer-123',
      });

      const softDeleteSpy = jest.spyOn(vehicle, 'softDelete');
      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(softDeleteSpy).toHaveBeenCalled();
    });

    it('should throw VehicleNotFoundException when vehicle does not exist', async () => {
      const input = { id: 'non-existent-id' };

      vehicleRepositoryMock.getById.mockRejectedValue(
        new VehicleNotFoundException(),
      );

      await expect(useCase.execute(input)).rejects.toThrow(
        VehicleNotFoundException,
      );
    });

    it('should archive the vehicle returned from repository', async () => {
      const vehicleId = 'vehicle-456';
      const input = { id: vehicleId };

      const vehicle = new Vehicle({
        id: vehicleId,
        licensePlate: new LicensePlate('XYZ9876'),
        brand: 'Honda',
        model: 'Civic',
        year: new Year(2023),
        customerId: 'customer-456',
      });

      vehicleRepositoryMock.getById.mockResolvedValue(vehicle);

      await useCase.execute(input);

      expect(vehicleRepositoryMock.getById).toHaveBeenCalledWith(vehicleId);
      expect(vehicleRepositoryMock.archive).toHaveBeenCalledWith(vehicle);
    });
  });
});
