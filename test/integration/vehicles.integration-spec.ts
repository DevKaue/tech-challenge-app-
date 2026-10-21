import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Vehicles (e2e)', () => {
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

  describe('POST /api/customers/:customerId/vehicles', () => {
    it('should create a vehicle for a customer', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post(`/api/customers/${seed.customer1Id}/vehicles`)
        .set(authHeader(token))
        .send({
          license_plate: 'XYZ9A99',
          brand: 'Ford',
          model: 'Focus',
          year: 2020,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.license_plate).toBe('XYZ9A99');
      expect(res.body.brand).toBe('Ford');
      expect(res.body.customer_id).toBe(seed.customer1Id);
    });

    it('should return 400 for empty plate', async () => {
      await request(testApp.app.getHttpServer())
        .post(`/api/customers/${seed.customer1Id}/vehicles`)
        .set(authHeader(token))
        .send({ license_plate: '' })
        .expect(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should list all vehicles', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/vehicles')
        .set(authHeader(token))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/vehicles/:id', () => {
    it('should return vehicle by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/vehicles/${seed.vehicle1Id}`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.id).toBe(seed.vehicle1Id);
      expect(res.body.license_plate).toBe('ABC1D23');
    });

    it('should return 404 for non-existent vehicle', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/vehicles/00000000-0000-0000-0000-000000000000')
        .set(authHeader(token))
        .expect(404);
    });
  });

  describe('PATCH /api/vehicles/:id', () => {
    it('should update vehicle', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/vehicles/${seed.vehicle1Id}`)
        .set(authHeader(token))
        .send({ brand: 'Toyota Updated' })
        .expect(200);

      expect(res.body.brand).toBe('Toyota Updated');
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should soft-delete vehicle', async () => {
      const created = await request(testApp.app.getHttpServer())
        .post(`/api/customers/${seed.customer1Id}/vehicles`)
        .set(authHeader(token))
        .send({
          license_plate: 'DEL9X99',
          brand: 'Del',
          model: 'X',
          year: 2019,
        });

      await request(testApp.app.getHttpServer())
        .delete(`/api/vehicles/${created.body.id}`)
        .set(authHeader(token))
        .expect(204);

      await request(testApp.app.getHttpServer())
        .get(`/api/vehicles/${created.body.id}`)
        .set(authHeader(token))
        .expect(404);
    });
  });
});
