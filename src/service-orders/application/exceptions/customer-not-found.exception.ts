export class CustomerNotFoundException extends Error {
  constructor(id: string) {
    super(`Customer ${id} not found`);
    this.name = 'CustomerNotFoundException';
  }
}
