import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Service Catalog (e2e)', () => {
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

  describe('POST /api/services', () => {
    it('should create a new service', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/services')
        .set(authHeader(token))
        .send({
          name: 'Troca de Pneu',
          description: 'Substituição completa do pneu',
          price: 200,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Troca de Pneu');
      expect(res.body.price).toBe(200);
    });

    it('should return 400 for invalid data', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/services')
        .set(authHeader(token))
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /api/services', () => {
    it('should list services', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/services')
        .set(authHeader(token))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should return service by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/services/${seed.service1Id}`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.id).toBe(seed.service1Id);
      expect(res.body.name).toBe('Troca de Óleo');
    });

    it('should return 404 for non-existent service', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/services/00000000-0000-0000-0000-000000000000')
        .set(authHeader(token))
        .expect(404);
    });
  });

  describe('PATCH /api/services/:id', () => {
    it('should update service', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/services/${seed.service1Id}`)
        .set(authHeader(token))
        .send({ price: 175 })
        .expect(200);

      expect(res.body.price).toBe(175);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service', async () => {
      const created = await request(testApp.app.getHttpServer())
        .post('/api/services')
        .set(authHeader(token))
        .send({ name: 'To Delete', description: 'X', price: 50 });

      await request(testApp.app.getHttpServer())
        .delete(`/api/services/${created.body.id}`)
        .set(authHeader(token))
        .expect(204);
    });
  });
});
