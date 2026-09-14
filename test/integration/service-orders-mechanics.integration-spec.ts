import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import {
  loginAsAttendant,
  loginAsMechanic,
  authHeader,
} from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Service Orders - Mechanics (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let seed: SeedData;
  let attendantToken: string;
  let mechanicToken: string;

  beforeAll(async () => {
    testApp = await createTestApp();
    prisma = testApp.prisma;
    seed = await seedTestData(prisma);
    const auth = await loginAsAttendant(testApp.app);
    attendantToken = auth.token;
    const mechAuth = await loginAsMechanic(testApp.app);
    mechanicToken = mechAuth.token;
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('Assign Mechanic', () => {
    it('should assign mechanic to OS in RECEIVED status', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

      const osId = osRes.body.id;

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: seed.mechanic1Id })
        .expect(200);

      expect(res.body.status).toBe('RECEIVED');
    });

    it('should return 400 when OS is not in RECEIVED status', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

      const osId = osRes.body.id;

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/diagnosis`)
        .set(authHeader(attendantToken))
        .send({ diagnosis: 'Diagnóstico' });

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: seed.mechanic1Id })
        .expect(400);
    });

    it('should return 404 for invalid mechanicId (non-mechanic user)', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

      const osId = osRes.body.id;

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: '00000000-0000-0000-0000-000000000000' })
        .expect(404);
    });
  });

  describe('Mechanic Availability', () => {
    it('should update mechanic availability', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/api/service-orders/me/availability')
        .set(authHeader(mechanicToken))
        .send({ available: false })
        .expect(200);

      expect(res.body).toBeDefined();
    });

    it('should set mechanic back to available', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch('/api/service-orders/me/availability')
        .set(authHeader(mechanicToken))
        .send({ available: true })
        .expect(200);

      expect(res.body).toBeDefined();
    });
  });

  describe('Finish Service', () => {
    it('should finish service as assigned mechanic', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

      const osId = osRes.body.id;

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: seed.mechanic1Id });

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/diagnosis`)
        .set(authHeader(attendantToken))
        .send({ diagnosis: 'Diagnóstico' });

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(attendantToken));

      await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estRes.body.id}/status`)
        .set(authHeader(attendantToken))
        .send({ status: 'APPROVED' });

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/finish`)
        .set(authHeader(mechanicToken))
        .send({ notes: 'Óleo trocado, filtro substituído' })
        .expect(200);

      expect(res.body.status).toBe('FINISHED');
    });
  });
});
