export class VehicleNotFoundException extends Error {
  constructor(vehicleId: string) {
    super(`Vehicle not found: ${vehicleId}`);
    this.name = 'VehicleNotFoundException';
  }
}
