import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import {
  CustomerIdentity,
  CustomerIdentityRepository,
} from '../../domain/contracts/customer-identity-repository.interface';
import { CustomerStatus } from '../../domain/enums/customer-status.enum';

@Injectable()
export class PrismaCustomerIdentityRepository implements CustomerIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CustomerIdentity | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true, status: true, deletedAt: true },
    });

    return customer
      ? { ...customer, status: customer.status as CustomerStatus }
      : null;
  }
}
