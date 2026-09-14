import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';

export default abstract class VehicleRepositoryInterface {
  abstract getById(id: string): Promise<Vehicle>;
  abstract findById(id: string): Promise<Vehicle | null>;
  abstract findByLicensePlate(
    licensePlate: LicensePlate,
  ): Promise<Vehicle | null>;
  abstract create(vehicle: Vehicle): Promise<void>;
  abstract update(vehicle: Vehicle): Promise<void>;
  abstract archive(vehicle: Vehicle): Promise<void>;
  abstract archiveAllByCustomerId(customerId: string): Promise<void>;
}
