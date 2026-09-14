import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createHmac } from 'crypto';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Service Orders - Estimates (e2e)', () => {
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

  async function createAndDiagnoseOS(): Promise<string> {
    const osRes = await request(testApp.app.getHttpServer())
      .post('/api/service-orders')
      .set(authHeader(token))
      .send({ customerId: seed.customer1Id, vehicleId: seed.vehicle1Id });

    const osId = osRes.body.id;

    await request(testApp.app.getHttpServer())
      .patch(`/api/service-orders/${osId}/diagnosis`)
      .set(authHeader(token))
      .send({ diagnosis: 'Diagnóstico para teste de orçamento' });

    return osId;
  }

  const webhookSecret = process.env.WEBHOOK_SECRET ?? 'test-webhook-secret';
  const sign = (body: string) =>
    `sha256=${createHmac('sha256', webhookSecret).update(body).digest('hex')}`;

  describe('Estimate CRUD', () => {
    it('should create estimate for diagnosed OS', async () => {
      const osId = await createAndDiagnoseOS();

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token))
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
    });

    it('should add PART item to estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const estimateId = estRes.body.id;

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(token))
        .send({
          itemType: 'PART',
          referenceId: seed.part1Id,
          quantity: 3,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.itemType).toBe('PART');
      expect(res.body.quantity).toBe(3);
    });

    it('should add SERVICE item to estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const estimateId = estRes.body.id;

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(token))
        .send({
          itemType: 'SERVICE',
          referenceId: seed.service1Id,
          quantity: 2,
        })
        .expect(201);

      expect(res.body.itemType).toBe('SERVICE');
      expect(res.body.quantity).toBe(2);
    });

    it('should approve estimate', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estRes.body.id}/status`)
        .set(authHeader(token))
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('should receive an external approval notification without JWT', async () => {
      const osId = await createAndDiagnoseOS();
      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const body = JSON.stringify({ decision: 'APPROVED' });
      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estRes.body.id}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
      const order = await prisma.serviceOrder.findUniqueOrThrow({
        where: { id: osId },
      });
      expect(order.status).toBe('IN_EXECUTION');
    });

    it('should reject estimate via status endpoint', async () => {
      const osId = await createAndDiagnoseOS();

      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estRes.body.id}/status`)
        .set(authHeader(token))
        .send({ status: 'REJECTED' })
        .expect(200);

      expect(res.body.status).toBe('REJECTED');
    });

    it('should receive an external rejection and restore reserved parts', async () => {
      const osId = await createAndDiagnoseOS();
      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));
      const stockBefore = await prisma.material.findUniqueOrThrow({
        where: { id: seed.part1Id },
      });

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estRes.body.id}/items`)
        .set(authHeader(token))
        .send({
          itemType: 'PART',
          referenceId: seed.part1Id,
          quantity: 2,
        })
        .expect(201);

      const body = JSON.stringify({ decision: 'REJECTED' });
      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estRes.body.id}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'REJECTED' })
        .expect(200);

      expect(res.body.status).toBe('IN_DIAGNOSIS');
      const order = await prisma.serviceOrder.findUniqueOrThrow({
        where: { id: osId },
      });
      expect(order.status).toBe('IN_DIAGNOSIS');

      const stockAfter = await prisma.material.findUniqueOrThrow({
        where: { id: seed.part1Id },
      });
      expect(stockAfter.stockQuantity).toBe(stockBefore.stockQuantity);

      const history = await prisma.serviceOrderStatusHistory.findFirstOrThrow({
        where: { serviceOrderId: osId },
        orderBy: { changedAt: 'desc' },
      });
      expect(history).toEqual(
        expect.objectContaining({
          changedBy: null,
          notes: 'Recusado via notificação externa',
          newStatus: 'IN_DIAGNOSIS',
        }),
      );
    });

    it('should reject estimate via /reject endpoint (returns to diagnosis)', async () => {
      const osId = await createAndDiagnoseOS();

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/reject`)
        .set(authHeader(token))
        .send({ reason: 'Preço muito alto' })
        .expect(200);

      expect(res.body.status).toBe('IN_DIAGNOSIS');
    });
  });

  describe('Estimate external notification (webhook)', () => {
    async function createPendingEstimate(): Promise<string> {
      const osId = await createAndDiagnoseOS();
      const estRes = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(token));

      return estRes.body.id;
    }

    it('rejects request without signature', async () => {
      const estimateId = await createPendingEstimate();

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .send({ decision: 'APPROVED' })
        .expect(401);
    });

    it('rejects request with invalid signature', async () => {
      const estimateId = await createPendingEstimate();

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', 'sha256=invalid')
        .send({ decision: 'APPROVED' })
        .expect(401);
    });

    it('approves estimate and moves OS to IN_EXECUTION', async () => {
      const estimateId = await createPendingEstimate();
      const body = JSON.stringify({ decision: 'APPROVED' });

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('is idempotent for a duplicate APPROVED notification', async () => {
      const estimateId = await createPendingEstimate();
      const body = JSON.stringify({ decision: 'APPROVED' });

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'APPROVED' })
        .expect(200);

      const dup = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'APPROVED' })
        .expect(200);

      expect(dup.body.status).toBe('APPROVED');
    });

    it('rejects conflicting REJECTED notification after APPROVED', async () => {
      const estimateId = await createPendingEstimate();
      const approveBody = JSON.stringify({ decision: 'APPROVED' });

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(approveBody))
        .send({ decision: 'APPROVED' })
        .expect(200);

      const rejectBody = JSON.stringify({ decision: 'REJECTED' });
      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(rejectBody))
        .send({ decision: 'REJECTED' })
        .expect(400);
    });

    it('rejects estimate via webhook and moves OS back to IN_DIAGNOSIS', async () => {
      const estimateId = await createPendingEstimate();
      const body = JSON.stringify({ decision: 'REJECTED' });

      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/external-status`)
        .set('x-webhook-signature', sign(body))
        .send({ decision: 'REJECTED' })
        .expect(200);

      expect(res.body.status).toBe('IN_DIAGNOSIS');
    });
  });
});
