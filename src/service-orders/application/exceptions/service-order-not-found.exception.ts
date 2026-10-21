export class ServiceOrderNotFoundException extends Error {
  constructor(id: string) {
    super(`Service order ${id} not found`);
    this.name = 'ServiceOrderNotFoundException';
  }
}
