import { Injectable } from '@nestjs/common';
import Customer from '@customer-management/domain/entities/customer.entity';
import CustomerFactory from '@customer-management/domain/factories/customer.factory';
import Document from '@customer-management/domain/value-objects/document.vo';
import CustomerRepositoryInterface from '@customer-management/domain/contracts/customer-repository.interface';
import PrismaUnitOfWorkService from '@customer-management/infra/services/prisma-unit-of-work.service';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';

@Injectable()
export default class PrismaCustomerRepository implements CustomerRepositoryInterface {
  constructor(private readonly uow: PrismaUnitOfWorkService) {}

  async getById(id: string): Promise<Customer> {
    const customerData = await this.uow.client.customer.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!customerData) {
      throw new CustomerNotFoundException();
    }

    return CustomerFactory.create({
      id: customerData.id,
      documentType: customerData.documentType,
      documentNumber: customerData.document,
      name: customerData.name,
      email: customerData.email ?? undefined,
      phone: customerData.phone ?? undefined,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const customerData = await this.uow.client.customer.findFirst({
      where: {
        id: id,
        deletedAt: null,
      },
    });

    if (!customerData) {
      return null;
    }

    return CustomerFactory.create({
      id: customerData.id,
      documentType: customerData.documentType,
      documentNumber: customerData.document,
      name: customerData.name,
      email: customerData.email ?? undefined,
      phone: customerData.phone ?? undefined,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    });
  }

  async findByDocument(
    document: Document,
    options?: { includeDeleted?: boolean },
  ): Promise<Customer | null> {
    const customerData = await this.uow.client.customer.findFirst({
      where: {
        document: document.value,
        documentType: document.type,
        ...(options?.includeDeleted ? {} : { deletedAt: null }),
      },
    });

    if (!customerData) {
      return null;
    }

    return CustomerFactory.create({
      id: customerData.id,
      documentType: customerData.documentType,
      documentNumber: customerData.document,
      name: customerData.name,
      email: customerData.email ?? undefined,
      phone: customerData.phone ?? undefined,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
      deletedAt: customerData.deletedAt ?? undefined,
    });
  }

  async create(customer: Customer): Promise<void> {
    await this.uow.client.customer.create({
      data: {
        id: customer.id,
        document: customer.document.value,
        documentType: customer.document.type,
        name: customer.name,
        email: customer.email?.value,
        phone: customer.phone,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
    });
  }

  async update(customer: Customer): Promise<void> {
    await this.uow.client.customer.update({
      where: { id: customer.id },
      data: {
        name: customer.name,
        email: customer.email?.value ?? null,
        phone: customer.phone ?? null,
        updatedAt: customer.updatedAt,
      },
    });
  }

  async archive(customer: Customer): Promise<void> {
    if (!customer.deletedAt) {
      throw new Error(
        'Customer must be soft deleted before calling repository delete method',
      );
    }

    await this.uow.client.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        deletedAt: customer.deletedAt,
      },
    });
  }
}
