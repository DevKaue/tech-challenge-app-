export default class VehicleNotFoundException extends Error {
  errorCode: string;

  constructor(message: string = 'Vehicle Not Found.') {
    super(message);
    this.name = 'VehicleNotFoundException';
    this.errorCode = 'vehicle_not_found';
  }
}
