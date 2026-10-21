import Customer from '@/customer-management/domain/entities/customer.entity';

export default interface CustomerDTO {
  id: string;
  documentType: string;
  documentNumber: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function toCustomerDTO(entity: Customer): CustomerDTO {
  return {
    id: entity.id,
    documentType: entity.document.type,
    documentNumber: entity.document.value,
    name: entity.name,
    email: entity.email?.value,
    phone: entity.phone,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
