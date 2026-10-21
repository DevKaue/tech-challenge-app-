export default class CustomerNotFoundException extends Error {
  errorCode: string;

  constructor(message: string = 'Customer Not Found.') {
    super(message);
    this.name = 'CustomerNotFoundException';
    this.errorCode = 'customer_not_found';
  }
}
