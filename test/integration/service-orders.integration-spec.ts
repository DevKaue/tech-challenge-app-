import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import {
  loginAsAttendant,
  loginAsMechanic,
  authHeader,
} from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { ServiceOrderStatus } from '@/service-orders/domain/enums/service-order-status.enum';

describe('Service Orders (e2e)', () => {
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

  describe('POST /api/service-orders', () => {
    it('should create a service order', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('should return 404 for non-existent customerId', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: '00000000-0000-0000-0000-000000000000',
          vehicleId: seed.vehicle1Id,
        })
        .expect(404);
    });

    it('should open a service order with services and parts', async () => {
      const stockBefore = await prisma.material.findUniqueOrThrow({
        where: { id: seed.part1Id },
      });

      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
          services: [{ referenceId: seed.service1Id, quantity: 1 }],
          parts: [{ referenceId: seed.part1Id, quantity: 2 }],
        })
        .expect(201);

      expect(res.body).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          status: ServiceOrderStatus.WAITING_APPROVAL,
        }),
      );

      const order = await prisma.serviceOrder.findUniqueOrThrow({
        where: { id: res.body.id },
        include: { estimates: { include: { items: true } } },
      });
      expect(order.estimates).toHaveLength(1);
      expect(order.estimates[0].items).toHaveLength(2);

      const stockAfter = await prisma.material.findUniqueOrThrow({
        where: { id: seed.part1Id },
      });
      expect(stockAfter.stockQuantity).toBe(stockBefore.stockQuantity - 2);
    });
  });

  describe('POST /api/service-orders with services and parts', () => {
    it('should create OS with initial estimate and move to WAITING_APPROVAL', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
          notes: 'Cliente relatou barulho no motor',
          services: [{ referenceId: seed.service1Id, quantity: 1 }],
          parts: [{ referenceId: seed.part1Id, quantity: 2 }],
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe(ServiceOrderStatus.WAITING_APPROVAL);
      expect(res.body.notes).toBe('Cliente relatou barulho no motor');
      expect(res.body.estimates).toHaveLength(1);
      expect(res.body.estimates[0].status).toBe('PENDING');
      expect(res.body.estimates[0].items).toHaveLength(2);
      const itemTypes = res.body.estimates[0].items.map((i: any) => i.itemType);
      expect(itemTypes.sort()).toEqual(['PART', 'SERVICE']);
      expect(res.body.estimates[0].totalAmount).toBe(220);
    });

    it('should return 404 for non-existent service in the initial estimate', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
          services: [
            {
              referenceId: '00000000-0000-0000-0000-000000000000',
              quantity: 1,
            },
          ],
        })
        .expect(404);
    });
  });

  describe('GET /api/service-orders/:id/status', () => {
    it('should return the current status with authentication', async () => {
      const createRes = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        })
        .expect(201);

      const res = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${createRes.body.id}/status`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body).toHaveProperty('id', createRes.body.id);
      expect(res.body).toHaveProperty('status', ServiceOrderStatus.RECEIVED);
      expect(res.body).toHaveProperty('updatedAt');
    });

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/service-orders/00000000-0000-0000-0000-000000000000/status')
        .expect(401);
    });

    it('should return 404 for non-existent OS', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/service-orders/00000000-0000-0000-0000-000000000000/status')
        .set(authHeader(attendantToken))
        .expect(404);
    });
  });

  describe('GET /api/service-orders', () => {
    it('should list service orders', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/service-orders')
        .set(authHeader(attendantToken))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should order active service orders by status and age and omit completed orders', async () => {
      const statuses = [
        ServiceOrderStatus.RECEIVED,
        ServiceOrderStatus.IN_DIAGNOSIS,
        ServiceOrderStatus.WAITING_APPROVAL,
        ServiceOrderStatus.IN_EXECUTION,
        ServiceOrderStatus.FINISHED,
        ServiceOrderStatus.DELIVERED,
        ServiceOrderStatus.CLOSED,
      ];
      const createdOrders = await Promise.all(
        statuses.map((status, index) =>
          prisma.serviceOrder.create({
            data: {
              customerId: seed.customer1Id,
              vehicleId: seed.vehicle1Id,
              status,
              createdAt: new Date(`2026-01-0${index + 1}T00:00:00.000Z`),
            },
          }),
        ),
      );

      const res = await request(testApp.app.getHttpServer())
        .get('/api/service-orders')
        .set(authHeader(attendantToken))
        .expect(200);

      const priority = new Map([
        [ServiceOrderStatus.IN_EXECUTION, 0],
        [ServiceOrderStatus.WAITING_APPROVAL, 1],
        [ServiceOrderStatus.IN_DIAGNOSIS, 2],
        [ServiceOrderStatus.RECEIVED, 3],
      ]);

      expect(
        res.body.every((order: { status: ServiceOrderStatus }) =>
          priority.has(order.status),
        ),
      ).toBe(true);

      for (let index = 1; index < res.body.length; index += 1) {
        const previous = res.body[index - 1];
        const current = res.body[index];
        const previousPriority = priority.get(previous.status) as number;
        const currentPriority = priority.get(current.status) as number;

        expect(currentPriority).toBeGreaterThanOrEqual(previousPriority);
        if (currentPriority === previousPriority) {
          expect(new Date(current.created_at).getTime()).toBeGreaterThanOrEqual(
            new Date(previous.created_at).getTime(),
          );
        }
      }

      const omittedIds = createdOrders
        .filter((order) => !priority.has(order.status as ServiceOrderStatus))
        .map((order) => order.id);
      expect(res.body.map((order: { id: string }) => order.id)).not.toEqual(
        expect.arrayContaining(omittedIds),
      );
    });

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/service-orders')
        .expect(401);
    });
  });

  describe('PATCH /api/service-orders/:id/status', () => {
    it('should update the status and register who made the change', async () => {
      const order = await prisma.serviceOrder.create({
        data: {
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        },
      });

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${order.id}/status`)
        .set(authHeader(attendantToken))
        .send({
          status: ServiceOrderStatus.IN_DIAGNOSIS,
          notes: 'Atualização recebida por e-mail',
        })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);

      const history = await prisma.serviceOrderStatusHistory.findFirst({
        where: { serviceOrderId: order.id },
        orderBy: { changedAt: 'desc' },
      });
      expect(history).toEqual(
        expect.objectContaining({
          previousStatus: ServiceOrderStatus.RECEIVED,
          newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
          changedBy: 'ana.test@oficina.com',
          notes: 'Atualização recebida por e-mail',
        }),
      );
    });

    it('should reject an invalid status', async () => {
      await request(testApp.app.getHttpServer())
        .patch(
          '/api/service-orders/00000000-0000-0000-0000-000000000000/status',
        )
        .set(authHeader(attendantToken))
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('Full lifecycle', () => {
    let osId: string;

    it('1. Create OS → RECEIVED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/service-orders')
        .set(authHeader(attendantToken))
        .send({
          customerId: seed.customer1Id,
          vehicleId: seed.vehicle1Id,
        })
        .expect(201);

      osId = res.body.id;
      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('2. Assign Mechanic (still RECEIVED)', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/mechanic`)
        .set(authHeader(attendantToken))
        .send({ mechanicId: seed.mechanic1Id })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.RECEIVED);
    });

    it('3. Start Diagnosis → IN_DIAGNOSIS', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/diagnosis`)
        .set(authHeader(attendantToken))
        .send({ diagnosis: 'Freio dianteiro com desgaste excessivo' })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
    });

    it('4. Create Estimate → WAITING_APPROVAL', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/${osId}/estimates`)
        .set(authHeader(attendantToken))
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('PENDING');
    });

    it('5. Add Estimate Items', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken));

      const estimateId = osRes.body.estimates[0].id;

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(attendantToken))
        .send({
          itemType: 'PART',
          referenceId: seed.part1Id,
          quantity: 2,
        })
        .expect(201);

      await request(testApp.app.getHttpServer())
        .post(`/api/service-orders/estimates/${estimateId}/items`)
        .set(authHeader(attendantToken))
        .send({
          itemType: 'SERVICE',
          referenceId: seed.service1Id,
          quantity: 1,
        })
        .expect(201);
    });

    it('6. Approve Estimate → IN_EXECUTION', async () => {
      const osRes = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken));

      const estimateId = osRes.body.estimates[0].id;

      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/estimates/${estimateId}/status`)
        .set(authHeader(attendantToken))
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(res.body.status).toBe('APPROVED');
    });

    it('7. Finish Service → FINISHED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/finish`)
        .set(authHeader(mechanicToken))
        .send({ notes: 'Serviço concluído com sucesso' })
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.FINISHED);
    });

    it('8. Deliver Vehicle → DELIVERED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/deliver`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.DELIVERED);
    });

    it('9. Close OS → CLOSED', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/service-orders/${osId}/close`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.status).toBe(ServiceOrderStatus.CLOSED);
    });

    it('10. Get OS detail with full history', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/service-orders/${osId}`)
        .set(authHeader(attendantToken))
        .expect(200);

      expect(res.body.id).toBe(osId);
      expect(res.body.status).toBe(ServiceOrderStatus.CLOSED);
      expect(Array.isArray(res.body.status_history)).toBe(true);
      expect(res.body.status_history.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('GET /api/service-orders/:id', () => {
    it('should return 404 for non-existent OS', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/service-orders/00000000-0000-0000-0000-000000000000')
        .set(authHeader(attendantToken))
        .expect(404);
    });
  });
});
