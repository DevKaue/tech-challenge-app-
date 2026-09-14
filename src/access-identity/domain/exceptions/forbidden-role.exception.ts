export class ForbiddenRoleException extends Error {
  constructor(message = 'Insufficient role for admin access') {
    super(message);
    this.name = 'ForbiddenRoleException';
  }
}
