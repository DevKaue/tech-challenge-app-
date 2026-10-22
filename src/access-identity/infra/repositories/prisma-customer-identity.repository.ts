import { Injectable } from '@nestjs/common';
import { CustomerStatus } from '@prisma/client';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { CustomerIdentityRepository } from '../../domain/contracts/customer-identity-repository.interface';

@Injectable()
export class PrismaCustomerIdentityRepository implements CustomerIdentityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async existsActive(id: string): Promise<boolean> {
    const count = await this.prisma.customer.count({
      where: { id, status: CustomerStatus.ACTIVE, deletedAt: null },
    });

    return count > 0;
  }
}
