export default class CustomerDTO {
  id!: string;
  documentType!: string;
  documentNumber!: string;
  name!: string;
  phone?: string;
  email?: string;
  createdAt!: Date;
  updatedAt?: Date;

  constructor(init?: Partial<CustomerDTO>) {
    Object.assign(this, init);
  }
}
