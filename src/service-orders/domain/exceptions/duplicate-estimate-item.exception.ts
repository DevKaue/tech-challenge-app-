export class DuplicateEstimateItemException extends Error {
  constructor(message = 'Duplicate estimate item') {
    super(message);
    this.name = 'DuplicateEstimateItemException';
  }
}
