import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Service Orders - Metrics (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let seed: SeedData;
  let token: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    prisma = testApp.prisma;
    seed = await seedTestData(prisma);
    const auth = await loginAsAttendant(testApp.app);
    token = auth.token;
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('GET /api/service-orders/metrics/average-time', () => {
    it('should return average execution time', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/service-orders/metrics/average-time')
        .set(authHeader(token))
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/service-orders/metrics/average-time')
        .expect(401);
    });
  });
});
