export class VehicleNotFoundException extends Error {
  constructor(id: string) {
    super(`Vehicle ${id} not found`);
    this.name = 'VehicleNotFoundException';
  }
}
