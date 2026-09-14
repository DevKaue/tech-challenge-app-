import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import VehicleAlreadyExistsException from '@customer-management/domain/exceptions/vehicle-already-exists.exception';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';

export default class VehicleRegistrationChecker {
  constructor(private readonly vehicleRepository: VehicleRepositoryInterface) {}

  async checkUniqueness(licensePlate: LicensePlate): Promise<void> {
    const existingVehicle =
      await this.vehicleRepository.findByLicensePlate(licensePlate);

    if (existingVehicle) {
      throw new VehicleAlreadyExistsException();
    }
  }
}
