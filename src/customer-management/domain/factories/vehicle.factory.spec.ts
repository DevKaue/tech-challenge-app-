import VehicleFactory from './vehicle.factory';
import Vehicle from '../entities/vehicle.entity';

describe('VehicleFactory', () => {
  describe('create', () => {
    it('should create a vehicle with all properties', () => {
      const vehicleId = 'vehicle-123';
      const licensePlate = 'ABC1234';
      const brand = 'Toyota';
      const model = 'Corolla';
      const year = 2020;
      const customerId = 'customer-123';
      const createdAt = new Date('2024-01-01');
      const updatedAt = new Date('2024-01-02');

      const vehicle = VehicleFactory.create({
        id: vehicleId,
        licensePlate,
        brand,
        model,
        year,
        customerId,
        createdAt,
        updatedAt,
      });

      expect(vehicle).toBeInstanceOf(Vehicle);
      expect(vehicle.id).toBe(vehicleId);
      expect(vehicle.licensePlate.value).toBe(licensePlate);
      expect(vehicle.brand).toBe(brand);
      expect(vehicle.model).toBe(model);
      expect(vehicle.year.value).toBe(year);
      expect(vehicle.customerId).toBe(customerId);
      expect(vehicle.createdAt).toBe(createdAt);
      expect(vehicle.updatedAt).toBe(updatedAt);
    });

    it('should create a vehicle without optional properties', () => {
      const licensePlate = 'ABC1234';
      const brand = 'Toyota';
      const model = 'Corolla';
      const year = 2020;
      const customerId = 'customer-123';

      const vehicle = VehicleFactory.create({
        licensePlate,
        brand,
        model,
        year,
        customerId,
      });

      expect(vehicle).toBeInstanceOf(Vehicle);
      expect(vehicle.licensePlate.value).toBe(licensePlate);
      expect(vehicle.brand).toBe(brand);
      expect(vehicle.model).toBe(model);
      expect(vehicle.year.value).toBe(year);
      expect(vehicle.customerId).toBe(customerId);
      expect(vehicle.deletedAt).toBeUndefined();
    });

    it('should generate a random UUID if id is not provided', () => {
      const vehicle = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      expect(vehicle.id).toBeDefined();
      expect(typeof vehicle.id).toBe('string');
      expect(vehicle.id.length).toBeGreaterThan(0);
    });

    it('should create two vehicles with different IDs when id is not provided', () => {
      const vehicle1 = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      const vehicle2 = VehicleFactory.create({
        licensePlate: 'XYZ9999',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        customerId: 'customer-123',
      });

      expect(vehicle1.id).not.toBe(vehicle2.id);
    });

    it('should clean up license plate by removing non-alphanumeric characters and converting to uppercase', () => {
      const vehicle = VehicleFactory.create({
        licensePlate: 'abc-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      expect(vehicle.licensePlate.value).toBe('ABC1234');
    });

    it('should accept traditional Brazilian license plate format', () => {
      const vehicle = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      expect(vehicle.licensePlate.value).toBe('ABC1234');
    });

    it('should accept Mercosul license plate format', () => {
      const vehicle = VehicleFactory.create({
        licensePlate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      expect(vehicle.licensePlate.value).toBe('ABC1D23');
    });

    it('should throw an error when license plate is invalid', () => {
      expect(() => {
        VehicleFactory.create({
          licensePlate: 'INVALID',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          customerId: 'customer-123',
        });
      }).toThrow();
    });

    it('should throw an error when year is invalid', () => {
      expect(() => {
        VehicleFactory.create({
          licensePlate: 'ABC1234',
          brand: 'Toyota',
          model: 'Corolla',
          year: 999,
          customerId: 'customer-123',
        });
      }).toThrow();
    });

    it('should create vehicle with deletedAt when provided', () => {
      const deletedAt = new Date('2024-01-03');

      const vehicle = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
        deletedAt,
      });

      expect(vehicle.deletedAt).toBe(deletedAt);
    });

    it('should set default dates when not provided', () => {
      const vehicle = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'customer-123',
      });

      expect(vehicle.createdAt).toBeInstanceOf(Date);
      expect(vehicle.updatedAt).toBeInstanceOf(Date);
    });

    it('should create vehicle with valid year range', () => {
      const vehicle1 = VehicleFactory.create({
        licensePlate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 1000,
        customerId: 'customer-123',
      });

      const vehicle2 = VehicleFactory.create({
        licensePlate: 'ABC1235',
        brand: 'Toyota',
        model: 'Corolla',
        year: 9999,
        customerId: 'customer-123',
      });

      expect(vehicle1.year.value).toBe(1000);
      expect(vehicle2.year.value).toBe(9999);
    });
  });
});
