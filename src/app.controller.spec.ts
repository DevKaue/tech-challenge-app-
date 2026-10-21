import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from '@common/infra/prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health (liveness)', () => {
    it('returns status ok with uptime and timestamp', () => {
      const result = appController.health();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
    });

    it('does not touch the database', () => {
      appController.health();

      expect(queryRaw).not.toHaveBeenCalled();
    });
  });

  describe('readiness', () => {
    it('returns status ok when the database answers', async () => {
      const result = await appController.readiness();

      expect(result).toEqual(
        expect.objectContaining({ status: 'ok', database: 'up' }),
      );
      expect(queryRaw).toHaveBeenCalledTimes(1);
    });

    it('throws 503 when the database is unreachable', async () => {
      queryRaw.mockRejectedValue(new Error('connection refused'));

      await expect(appController.readiness()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
    });
  });
});
