import VehicleQueryServiceInterface from '@customer-management/application/contracts/vehicle-query-service.interface';
import type VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export type ListVehicleInput = {
  customerId?: string;
};

export type ListVehicleOutput = {
  vehicles: VehicleDTO[];
};

export default class ListVehicleUseCase {
  constructor(
    private readonly vehicleQueryService: VehicleQueryServiceInterface,
  ) {}

  async execute(input: ListVehicleInput): Promise<ListVehicleOutput> {
    const vehicles = await this.vehicleQueryService.findAll({
      customerId: input.customerId,
    });
    return { vehicles };
  }
}
