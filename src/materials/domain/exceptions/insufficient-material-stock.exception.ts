export default class InsufficientMaterialStockException extends Error {
  constructor(materialName: string, availableQuantity: number) {
    super(
      `Insufficient stock for material ${materialName}. Available: ${availableQuantity}`,
    );
    this.name = 'InsufficientMaterialStockException';
  }
}
