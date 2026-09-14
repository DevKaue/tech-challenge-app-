export class UserNotMechanicException extends Error {
  constructor(message = 'User is not a mechanic') {
    super(message);
    this.name = 'UserNotMechanicException';
  }
}
