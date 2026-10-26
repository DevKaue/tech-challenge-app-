import UnitOfWorkServiceInterface from '@/common/application/contracts/unit-of-work-service.interface';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Prisma } from '@prisma/client';

type TransactionScope = {
  tx: Prisma.TransactionClient;
  afterCommit: Array<() => void>;
};

@Injectable()
export default class PrismaUnitOfWorkService implements UnitOfWorkServiceInterface {
  private static readonly asyncLocalStorage =
    new AsyncLocalStorage<TransactionScope>();

  constructor(private readonly prisma: PrismaService) {}

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const afterCommit: Array<() => void> = [];

    const result = await this.prisma.$transaction(async (tx) => {
      return PrismaUnitOfWorkService.asyncLocalStorage.run(
        { tx, afterCommit },
        work,
      );
    });

    // Só depois do COMMIT: um rollback descarta os callbacks junto com os dados.
    for (const callback of afterCommit) callback();

    return result;
  }

  get client(): Prisma.TransactionClient | PrismaService {
    const scope = PrismaUnitOfWorkService.asyncLocalStorage.getStore();
    return scope?.tx ?? this.prisma;
  }

  /**
   * Agenda um efeito colateral (hoje, o log de evento de negócio) para depois
   * do commit da transação corrente. Fora de transação, roda na hora. Assim o
   * dashboard nunca conta uma OS que o rollback desfez.
   */
  afterCommit(callback: () => void): void {
    const scope = PrismaUnitOfWorkService.asyncLocalStorage.getStore();
    if (scope) {
      scope.afterCommit.push(callback);
      return;
    }
    callback();
  }
}
