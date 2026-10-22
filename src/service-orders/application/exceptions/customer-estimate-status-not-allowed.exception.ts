export class CustomerEstimateStatusNotAllowedException extends Error {
  constructor(message?: string) {
    super(message ?? 'Customers can only approve or reject an estimate');
    this.name = 'CustomerEstimateStatusNotAllowedException';
  }
}
