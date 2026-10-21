export default class VehicleDTO {
  id!: string;
  licensePlate!: string;
  brand!: string;
  model!: string;
  year!: number;
  customerId!: string;
  createdAt!: Date;
  updatedAt?: Date;

  constructor(init?: Partial<VehicleDTO>) {
    Object.assign(this, init);
  }
}
