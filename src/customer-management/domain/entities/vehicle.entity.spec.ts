import Vehicle from './vehicle.entity';
import LicensePlate from '../value-objects/license-plate.vo';
import Year from '../value-objects/year.vo';

describe('Vehicle Entity', () => {
  let licensePlate: LicensePlate;
  let year: Year;

  beforeEach(() => {
    licensePlate = new LicensePlate('ABC1234');
    year = new Year(2020);
  });

  describe('Constructor', () => {
    it('should create a vehicle with all properties', () => {
      const vehicleId = 'vehicle-123';
      const brand = 'Toyota';
      const model = 'Corolla';
      const customerId = 'customer-123';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const vehicle = new Vehicle({
        id: vehicleId,
        licensePlate,
        brand,
        model,
        year,
        customerId,
        createdAt,
        updatedAt,
      });

      expect(vehicle.id).toBe(vehicleId);
      expect(vehicle.licensePlate).toBe(licensePlate);
      expect(vehicle.brand).toBe(brand);
      expect(vehicle.model).toBe(model);
      expect(vehicle.year).toBe(year);
      expect(vehicle.customerId).toBe(customerId);
      expect(vehicle.createdAt).toBe(createdAt);
      expect(vehicle.updatedAt).toBe(updatedAt);
    });

    it('should create a vehicle without optional properties', () => {
      const vehicleId = 'vehicle-123';
      const brand = 'Toyota';
      const model = 'Corolla';
      const customerId = 'customer-123';

      const vehicle = new Vehicle({
        id: vehicleId,
        licensePlate,
        brand,
        model,
        year,
        customerId,
      });

      expect(vehicle.id).toBe(vehicleId);
      expect(vehicle.licensePlate).toBe(licensePlate);
      expect(vehicle.brand).toBe(brand);
      expect(vehicle.model).toBe(model);
      expect(vehicle.year).toBe(year);
      expect(vehicle.customerId).toBe(customerId);
      expect(vehicle.deletedAt).toBeUndefined();
    });

    it('should set default dates if not provided', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      expect(vehicle.createdAt).toBeInstanceOf(Date);
      expect(vehicle.updatedAt).toBeInstanceOf(Date);
    });

    it('should initialize with deletedAt as undefined', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      expect(vehicle.deletedAt).toBeUndefined();
    });
  });

  describe('Getters', () => {
    let vehicle: Vehicle;

    beforeEach(() => {
      vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });
    });

    it('should return id', () => {
      expect(vehicle.id).toBe('vehicle-123');
    });

    it('should return licensePlate', () => {
      expect(vehicle.licensePlate).toBe(licensePlate);
    });

    it('should return brand', () => {
      expect(vehicle.brand).toBe('Toyota');
    });

    it('should return model', () => {
      expect(vehicle.model).toBe('Corolla');
    });

    it('should return year', () => {
      expect(vehicle.year).toBe(year);
    });

    it('should return customerId', () => {
      expect(vehicle.customerId).toBe('customer-123');
    });

    it('should return createdAt', () => {
      expect(vehicle.createdAt).toBeInstanceOf(Date);
    });

    it('should return updatedAt', () => {
      expect(vehicle.updatedAt).toBeInstanceOf(Date);
    });

    it('should return deletedAt', () => {
      expect(vehicle.deletedAt).toBeUndefined();
    });
  });

  describe('changeLicensePlate', () => {
    it('should change vehicle license plate', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      const newLicensePlate = new LicensePlate('XYZ9999');
      vehicle.changeLicensePlate(newLicensePlate);

      expect(vehicle.licensePlate).toBe(newLicensePlate);
    });

    it('should update updatedAt when changing license plate', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = vehicle.updatedAt;
      const newLicensePlate = new LicensePlate('XYZ9999');

      vehicle.changeLicensePlate(newLicensePlate);

      expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('changeBrand', () => {
    it('should change vehicle brand', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      vehicle.changeBrand('Honda');

      expect(vehicle.brand).toBe('Honda');
    });

    it('should update updatedAt when changing brand', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = vehicle.updatedAt;

      vehicle.changeBrand('Honda');

      expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('changeModel', () => {
    it('should change vehicle model', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      vehicle.changeModel('Camry');

      expect(vehicle.model).toBe('Camry');
    });

    it('should update updatedAt when changing model', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = vehicle.updatedAt;

      vehicle.changeModel('Camry');

      expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('changeYear', () => {
    it('should change vehicle year', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      const newYear = new Year(2023);
      vehicle.changeYear(newYear);

      expect(vehicle.year).toBe(newYear);
    });

    it('should update updatedAt when changing year', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
        updatedAt: new Date('2024-01-01'),
      });

      const previousUpdatedAt = vehicle.updatedAt;
      const newYear = new Year(2023);

      vehicle.changeYear(newYear);

      expect(vehicle.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete a vehicle', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      expect(vehicle.deletedAt).toBeUndefined();

      vehicle.softDelete();

      expect(vehicle.deletedAt).toBeInstanceOf(Date);
    });

    it('should update deletedAt timestamp when soft deleting', () => {
      const vehicle = new Vehicle({
        id: 'vehicle-123',
        licensePlate,
        brand: 'Toyota',
        model: 'Corolla',
        year,
        customerId: 'customer-123',
      });

      const beforeDelete = new Date();
      vehicle.softDelete();
      const afterDelete = new Date();

      expect(vehicle.deletedAt!.getTime()).toBeGreaterThanOrEqual(
        beforeDelete.getTime(),
      );
      expect(vehicle.deletedAt!.getTime()).toBeLessThanOrEqual(
        afterDelete.getTime(),
      );
    });
  });
});
