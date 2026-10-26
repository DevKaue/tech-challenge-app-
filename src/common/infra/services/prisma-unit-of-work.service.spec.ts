import PrismaUnitOfWorkService from './prisma-unit-of-work.service';
import type { PrismaService } from '@/common/infra/prisma/prisma.service';

function prismaWith(transaction: jest.Mock): PrismaService {
  return { $transaction: transaction } as unknown as PrismaService;
}

describe('PrismaUnitOfWorkService.afterCommit', () => {
  it('roda o callback só depois do commit', async () => {
    const order: string[] = [];
    const uow = new PrismaUnitOfWorkService(
      prismaWith(
        jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn({})),
      ),
    );

    await uow.runInTransaction(() => {
      uow.afterCommit(() => order.push('evento'));
      order.push('fim do trabalho');
      return Promise.resolve();
    });

    expect(order).toEqual(['fim do trabalho', 'evento']);
  });

  it('descarta o callback quando a transação faz rollback', async () => {
    const callback = jest.fn();
    const uow = new PrismaUnitOfWorkService(
      prismaWith(
        jest.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
          await fn({});
          throw new Error('rollback');
        }),
      ),
    );

    await expect(
      uow.runInTransaction(() => {
        uow.afterCommit(callback);
        return Promise.resolve();
      }),
    ).rejects.toThrow('rollback');
    expect(callback).not.toHaveBeenCalled();
  });

  it('fora de transação roda na hora', () => {
    const callback = jest.fn();
    new PrismaUnitOfWorkService(prismaWith(jest.fn())).afterCommit(callback);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('client usa a transação corrente e, fora dela, o PrismaService', async () => {
    const tx = { marker: 'tx' };
    const prisma = prismaWith(
      jest.fn(async (fn: (t: unknown) => Promise<unknown>) => fn(tx)),
    );
    const uow = new PrismaUnitOfWorkService(prisma);

    let inside: unknown;
    await uow.runInTransaction(() => {
      inside = uow.client;
      return Promise.resolve();
    });

    expect(inside).toBe(tx);
    expect(uow.client).toBe(prisma);
  });
});
