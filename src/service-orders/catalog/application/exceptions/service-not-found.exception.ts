export default class ServiceNotFoundException extends Error {
  constructor(message: string = 'Service not found.') {
    super(message);
    this.name = 'ServiceNotFoundException';
  }
}
