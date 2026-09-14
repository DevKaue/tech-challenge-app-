import VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export interface VehicleResponse {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  customer_id: string;
  created_at: Date | string;
  updated_at?: Date | string;
}

export class JsonVehiclePresenter {
  static present(vehicle: VehicleDTO): VehicleResponse {
    return {
      id: vehicle.id,
      license_plate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      customer_id: vehicle.customerId,
      created_at: vehicle.createdAt,
      updated_at: vehicle.updatedAt,
    };
  }

  static presentMany(vehicles: VehicleDTO[]): VehicleResponse[] {
    return vehicles.map((vehicle) => this.present(vehicle));
  }
}
