export class InvalidMaterialDataException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMaterialDataException';
  }
}
