import Vehicle from '@customer-management/domain/entities/vehicle.entity';
import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';
import Year from '@customer-management/domain/value-objects/year.vo';

export default class VehicleFactory {
  static create(props: {
    id?: string;
    licensePlate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }): Vehicle {
    const licensePlate = new LicensePlate(props.licensePlate);
    const year = new Year(props.year);

    return new Vehicle({
      id: props.id ?? crypto.randomUUID(),
      licensePlate: licensePlate,
      brand: props.brand,
      model: props.model,
      year: year,
      customerId: props.customerId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
  }
}
