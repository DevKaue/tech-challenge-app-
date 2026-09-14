import UnitOfWorkServiceInterface from '@/common/application/contracts/unit-of-work-service.interface';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';

@Injectable()
export default class PrismaUnitOfWorkService implements UnitOfWorkServiceInterface {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<Prisma.TransactionClient>();

  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      return PrismaUnitOfWorkService.asyncLocalStorage.run(tx, work);
    });
  }

  get client(): Prisma.TransactionClient | PrismaService {
    const txClient = PrismaUnitOfWorkService.asyncLocalStorage.getStore();
    return txClient ?? this.prisma;
  }
}
