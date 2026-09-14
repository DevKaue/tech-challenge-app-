export class UnauthorizedMechanicException extends Error {
  constructor(message?: string) {
    super(message ?? 'Mechanic not authorized for this operation');
    this.name = 'UnauthorizedMechanicException';
  }
}
