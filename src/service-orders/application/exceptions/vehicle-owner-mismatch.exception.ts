export class VehicleOwnerMismatchException extends Error {
  constructor(vehicleId: string, customerId: string) {
    super(`Vehicle ${vehicleId} does not belong to customer ${customerId}`);
    this.name = 'VehicleOwnerMismatchException';
  }
}
