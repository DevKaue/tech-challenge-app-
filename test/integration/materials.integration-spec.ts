import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Materials (e2e)', () => {
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

  describe('POST /api/materials', () => {
    it('should create a PART material', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({
          name: 'Pastilha de Freio',
          description: 'Pastilha dianteira',
          price: 80,
          type: 'PART',
          stockQuantity: 10,
          stockUnit: 'UNIT',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Pastilha de Freio');
      expect(res.body.type).toBe('PART');
    });

    it('should create a SUPPLY material', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({
          name: 'Graxa',
          description: 'Graxa para lubrificação',
          price: 15,
          type: 'SUPPLY',
          stockQuantity: 5,
          stockUnit: 'KILOGRAM',
        })
        .expect(201);

      expect(res.body.type).toBe('SUPPLY');
    });

    it('should return 400 for invalid data', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({ name: '' })
        .expect(400);
    });
  });

  describe('GET /api/materials', () => {
    it('should list materials', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/materials')
        .set(authHeader(token))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/materials/:id', () => {
    it('should return material by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/materials/${seed.part1Id}`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.id).toBe(seed.part1Id);
      expect(res.body.name).toBe('Filtro de Óleo');
    });

    it('should return 404 for non-existent material', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/materials/00000000-0000-0000-0000-000000000000')
        .set(authHeader(token))
        .expect(404);
    });
  });

  describe('PATCH /api/materials/:id/stock', () => {
    it('should add stock quantity', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/materials/${seed.part1Id}/stock`)
        .set(authHeader(token))
        .send({ quantity: 5 })
        .expect(200);

      expect(res.body.stockQuantity).toBe(20);
    });
  });

  describe('PATCH /api/materials/:id', () => {
    it('should update material', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/materials/${seed.part1Id}`)
        .set(authHeader(token))
        .send({ price: 40 })
        .expect(200);

      expect(res.body.price).toBe(40);
    });
  });

  describe('DELETE /api/materials/:id', () => {
    it('should delete material', async () => {
      const created = await request(testApp.app.getHttpServer())
        .post('/api/materials')
        .set(authHeader(token))
        .send({
          name: 'To Delete',
          description: 'X',
          price: 10,
          type: 'PART',
          stockQuantity: 1,
          stockUnit: 'UNIT',
        });

      await request(testApp.app.getHttpServer())
        .delete(`/api/materials/${created.body.id}`)
        .set(authHeader(token))
        .expect(200);
    });
  });
});
