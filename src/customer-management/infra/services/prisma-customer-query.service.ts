import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

import CustomerQueryServiceInterface from '@customer-management/application/contracts/customer-query-service.interface';
import CustomerDTO from '@customer-management/application/dtos/customer.dto';
import CustomerNotFoundException from '@/customer-management/domain/exceptions/customer-not-found.exception';

@Injectable()
export default class PrismaCustomerQueryService implements CustomerQueryServiceInterface {
  constructor(private readonly prisma: PrismaService) {}

  async getById(props: { id: string }): Promise<CustomerDTO> {
    const customerData = await this.prisma.customer.findFirst({
      where: {
        id: props.id,
        deletedAt: null,
      },
    });
    if (customerData) {
      const customerDTO: CustomerDTO = {
        id: customerData.id,
        documentType: customerData.documentType,
        documentNumber: customerData.document,
        name: customerData.name,
        email: customerData.email ?? undefined,
        phone: customerData.phone ?? undefined,
        createdAt: customerData.createdAt,
        updatedAt: customerData.updatedAt,
      };
      return customerDTO;
    }

    throw new CustomerNotFoundException();
  }

  async findAll(): Promise<CustomerDTO[]> {
    const customers = await this.prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });

    return customers.map((customerData) => ({
      id: customerData.id,
      documentType: customerData.documentType,
      documentNumber: customerData.document,
      name: customerData.name,
      email: customerData.email ?? undefined,
      phone: customerData.phone ?? undefined,
      createdAt: customerData.createdAt,
      updatedAt: customerData.updatedAt,
    }));
  }
}
