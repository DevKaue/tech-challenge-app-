import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import type VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export type FindVehicleByIdInput = {
  id: string;
};

export type FindVehicleByIdOutput = {
  vehicle: VehicleDTO;
};

export default class FindVehicleByIdUseCase {
  constructor(
    private readonly vehicleQueryService: VehicleQueryServiceInterface,
  ) {}

  async execute(input: FindVehicleByIdInput): Promise<FindVehicleByIdOutput> {
    const vehicle = await this.vehicleQueryService.getById({ id: input.id });

    const output: FindVehicleByIdOutput = {
      vehicle,
    };

    return output;
  }
}
