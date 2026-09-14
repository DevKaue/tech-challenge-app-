import Customer from '@customer-management/domain/entities/customer.entity';
import Email from '@customer-management/domain/value-objects/email.vo';
import Document from '@customer-management/domain/value-objects/document.vo';

import { DocumentType } from '@customer-management/domain/enums/document-type.enum';

export default class CustomerFactory {
  static create(props: {
    id?: string;
    documentType: string;
    documentNumber: string;
    name: string;
    email?: string;
    phone?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
  }): Customer {
    const document = new Document(
      props.documentType as DocumentType,
      props.documentNumber,
    );
    const email = props.email ? new Email(props.email) : undefined;

    return new Customer({
      id: props.id ?? crypto.randomUUID(),
      document: document,
      name: props.name,
      phone: props.phone,
      email: email,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    });
  }
}
