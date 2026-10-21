import VehicleRepositoryInterface from '@customer-management/domain/contracts/vehicle-repository.interface';
import CustomerRepositoryInterface from '@/customer-management/domain/contracts/customer-repository.interface';

import VehicleFactory from '@customer-management/domain/factories/vehicle.factory';

import { toVehicleDTO } from '@customer-management/application/dtos/vehicle.dto';
import type VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

import VehicleRegistrationChecker from '@/customer-management/domain/services/vehicle-registration-checker.service';

export type CreateVehicleInput = {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  customerId: string;
};

export type CreateVehicleOutput = {
  vehicle: VehicleDTO;
};

export class CreateVehicleUseCase {
  constructor(
    private readonly vehicleRepository: VehicleRepositoryInterface,
    private readonly customerRepository: CustomerRepositoryInterface,
    private readonly registrationChecker: VehicleRegistrationChecker,
  ) {}

  async execute(input: CreateVehicleInput): Promise<CreateVehicleOutput> {
    const existingCustomer = await this.customerRepository.getById(
      input.customerId,
    );

    const vehicle = VehicleFactory.create({
      licensePlate: input.licensePlate,
      brand: input.brand,
      model: input.model,
      year: input.year,
      customerId: existingCustomer.id,
    });

    await this.registrationChecker.checkUniqueness(vehicle.licensePlate);

    await this.vehicleRepository.create(vehicle);

    const output: CreateVehicleOutput = {
      vehicle: toVehicleDTO(vehicle),
    };

    return output;
  }
}
