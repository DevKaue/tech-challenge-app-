import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import VehicleNotFoundException from '@/customer-management/domain/exceptions/vehicle-not-found.exception';

export default class InMemoryVehicleRepository implements VehicleRepositoryInterface {
  private vehicles: Vehicle[] = [];

  async getById(id: string): Promise<Vehicle> {
    const vehicle = this.vehicles.find((v) => v.id === id && !v.deletedAt);

    if (!vehicle) {
      throw new VehicleNotFoundException();
    }

    return vehicle;
  }

  async findById(id: string): Promise<Vehicle | null> {
    const vehicle = this.vehicles.find((v) => v.id === id && !v.deletedAt);
    return vehicle || null;
  }

  async findByLicensePlate(
    licensePlate: LicensePlate,
  ): Promise<Vehicle | null> {
    const vehicle = this.vehicles.find(
      (v) => v.licensePlate.value === licensePlate.value && !v.deletedAt,
    );
    return vehicle || null;
  }

  async create(vehicle: Vehicle): Promise<void> {
    this.vehicles.push(vehicle);
  }

  async update(vehicle: Vehicle): Promise<void> {
    const index = this.vehicles.findIndex(
      (v) => v.id === vehicle.id && !v.deletedAt,
    );

    if (index === -1) {
      throw new VehicleNotFoundException();
    }

    this.vehicles[index] = vehicle;
  }

  async archive(vehicle: Vehicle): Promise<void> {
    if (!vehicle.deletedAt) {
      throw new Error(
        'Vehicle must be soft deleted before calling repository delete method',
      );
    }

    const index = this.vehicles.findIndex((v) => v.id === vehicle.id);
    if (index !== -1) {
      this.vehicles[index] = vehicle;
    }
  }

  async archiveAllByCustomerId(customerId: string): Promise<void> {
    this.vehicles.forEach((v) => {
      if (v.customerId === customerId && !v.deletedAt) {
        Object.assign(v, { deletedAt: new Date() });
      }
    });
  }
}
