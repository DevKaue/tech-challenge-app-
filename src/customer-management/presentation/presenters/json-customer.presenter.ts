import CustomerDTO from '@customer-management/application/dtos/customer.dto';

export interface CustomerResponse {
  id: string;
  document_type: string;
  document_number: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: Date | string;
  updated_at?: Date | string | null;
}

export class JsonCustomerPresenter {
  static present(customer: CustomerDTO): CustomerResponse {
    return {
      id: customer.id,
      document_type: customer.documentType,
      document_number: customer.documentNumber,
      name: customer.name,
      email: customer.email ?? null,
      phone: customer.phone ?? null,
      created_at: customer.createdAt,
      updated_at: customer.updatedAt ?? null,
    };
  }

  static presentMany(customers: CustomerDTO[]): CustomerResponse[] {
    return customers.map((customer) => this.present(customer));
  }
}
