export class InvalidStatusTransitionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionException';
  }
}
