import type VehicleDTO from '@customer-management/application/dtos/vehicle.dto';

export default abstract class VehicleQueryServiceInterface {
  abstract getById(props: { id: string }): Promise<VehicleDTO>;
  abstract findAll(props?: { customerId?: string }): Promise<VehicleDTO[]>;
}
