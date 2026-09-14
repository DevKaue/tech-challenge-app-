export class InsufficientStockException extends Error {
  constructor(partName: string, available: number) {
    super(`Insufficient stock for part ${partName}. Available: ${available}`);
    this.name = 'InsufficientStockException';
  }
}
