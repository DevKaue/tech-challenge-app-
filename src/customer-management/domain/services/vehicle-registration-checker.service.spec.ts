import VehicleRegistrationChecker from './vehicle-registration-checker.service';
import VehicleRepositoryInterface from '../contracts/vehicle-repository.interface';
import LicensePlate from '../value-objects/license-plate.vo';
import Vehicle from '../entities/vehicle.entity';
import Year from '../value-objects/year.vo';
import VehicleAlreadyExistsException from '../exceptions/vehicle-already-exists.exception';

describe('VehicleRegistrationChecker Service', () => {
  let service: VehicleRegistrationChecker;
  let mockVehicleRepository: jest.Mocked<VehicleRepositoryInterface>;

  beforeEach(() => {
    mockVehicleRepository = {
      getById: jest.fn(),
      findById: jest.fn(),
      findByLicensePlate: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      archive: jest.fn(),
      archiveAllByCustomerId: jest.fn(),
    };

    service = new VehicleRegistrationChecker(mockVehicleRepository);
  });

  describe('checkUniqueness', () => {
    it('should allow registration when vehicle does not exist', async () => {
      const licensePlate = new LicensePlate('ABC1234');
      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);

      await expect(
        service.checkUniqueness(licensePlate),
      ).resolves.not.toThrow();
      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        licensePlate,
      );
    });

    it('should throw VehicleAlreadyExistsException when vehicle exists', async () => {
      const licensePlate = new LicensePlate('ABC1234');
      const existingVehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2020),
        customerId: 'customer-123',
      });

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(
        existingVehicle,
      );

      await expect(service.checkUniqueness(licensePlate)).rejects.toThrow(
        VehicleAlreadyExistsException,
      );
      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        licensePlate,
      );
    });

    it('should call repository with the correct license plate', async () => {
      const licensePlate = new LicensePlate('XYZ9999');
      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);

      await service.checkUniqueness(licensePlate);

      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledWith(
        licensePlate,
      );
    });

    it('should verify repository is called exactly once', async () => {
      const licensePlate = new LicensePlate('ABC1234');
      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);

      await service.checkUniqueness(licensePlate);

      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledTimes(1);
    });

    it('should handle repository errors', async () => {
      const licensePlate = new LicensePlate('ABC1234');
      const error = new Error('Database error');
      mockVehicleRepository.findByLicensePlate.mockRejectedValueOnce(error);

      await expect(service.checkUniqueness(licensePlate)).rejects.toThrow(
        'Database error',
      );
    });

    it('should allow multiple vehicles with different license plates', async () => {
      const licensePlate1 = new LicensePlate('ABC1234');
      const licensePlate2 = new LicensePlate('XYZ9999');

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);
      await expect(
        service.checkUniqueness(licensePlate1),
      ).resolves.not.toThrow();

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);
      await expect(
        service.checkUniqueness(licensePlate2),
      ).resolves.not.toThrow();

      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledTimes(2);
    });

    it('should work with both traditional and Mercosul license plate formats', async () => {
      const traditionalPlate = new LicensePlate('ABC1234');
      const mercosulPlate = new LicensePlate('ABC1D23');

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);
      await expect(
        service.checkUniqueness(traditionalPlate),
      ).resolves.not.toThrow();

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(null);
      await expect(
        service.checkUniqueness(mercosulPlate),
      ).resolves.not.toThrow();

      expect(mockVehicleRepository.findByLicensePlate).toHaveBeenCalledTimes(2);
    });

    it('should reject when vehicle with deleted license plate exists', async () => {
      const licensePlate = new LicensePlate('ABC1234');
      const deletedVehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year: new Year(2020),
        customerId: 'customer-123',
        deletedAt: new Date(),
      });

      mockVehicleRepository.findByLicensePlate.mockResolvedValueOnce(
        deletedVehicle,
      );

      await expect(service.checkUniqueness(licensePlate)).rejects.toThrow(
        VehicleAlreadyExistsException,
      );
    });
  });
});
