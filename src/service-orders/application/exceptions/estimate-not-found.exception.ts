export class EstimateNotFoundException extends Error {
  constructor(id: string) {
    super(`Estimate ${id} not found`);
    this.name = 'EstimateNotFoundException';
  }
}
