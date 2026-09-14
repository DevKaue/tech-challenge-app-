export default class VehicleAlreadyExistsException extends Error {
  errorCode: string;

  constructor(
    message: string = 'Vehicle with this license plate already exists',
  ) {
    super(message);
    this.name = 'VehicleAlreadyExistsException';
    this.errorCode = 'vehicle_already_exists';
  }
}
