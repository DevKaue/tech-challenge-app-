import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';

export type ArchiveVehicleInput = {
  id: string;
};

export default class ArchiveVehicleUseCase {
  constructor(private readonly vehicleRepository: VehicleRepositoryInterface) {}

  async execute(input: ArchiveVehicleInput): Promise<void> {
    const vehicle = await this.vehicleRepository.getById(input.id);

    vehicle.softDelete();

    await this.vehicleRepository.archive(vehicle);
  }
}
