export default class DomainException extends Error {
  constructor(message: string = 'Domain exception') {
    super(message);
    this.name = 'DomainException';
  }
}
