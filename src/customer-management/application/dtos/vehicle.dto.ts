import Vehicle from '@customer-management/domain/entities/vehicle.entity';

export default interface VehicleDTO {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  customerId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function toVehicleDTO(entity: Vehicle): VehicleDTO {
  return {
    id: entity.id,
    licensePlate: entity.licensePlate.value,
    brand: entity.brand,
    model: entity.model,
    year: entity.year.value,
    customerId: entity.customerId,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
