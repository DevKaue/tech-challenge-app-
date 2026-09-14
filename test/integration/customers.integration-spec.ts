import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Customers (e2e)', () => {
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

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/customers')
        .set(authHeader(token))
        .send({
          name: 'Pedro Silva',
          documentNumber: '81453173633',
          documentType: 'CPF',
          email: 'pedro@email.com',
          phone: '(11) 97777-0001',
        });

      if (res.status !== 201) {
        console.error(
          'CREATE CUSTOMER FAILED:',
          res.status,
          JSON.stringify(res.body),
        );
      }
      expect(res.status).toBe(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Pedro Silva');
      expect(res.body.document_number).toBe('81453173633');
      expect(res.body.email).toBe('pedro@email.com');
    });

    it('should return 400 for invalid document', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/customers')
        .set(authHeader(token))
        .send({
          name: 'Invalid',
          documentNumber: '12345678901',
          documentType: 'CPF',
          email: 'inv@email.com',
          phone: '(11) 90000-0000',
        })
        .expect(400);
    });

    it('should return 409 for duplicate document', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/customers')
        .set(authHeader(token))
        .send({
          name: 'Dup Customer',
          documentNumber: '52998224725',
          documentType: 'CPF',
          email: 'dup@email.com',
          phone: '(11) 90000-0000',
        })
        .expect(409);
    });
  });

  describe('GET /api/customers', () => {
    it('should list customers', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get('/api/customers')
        .set(authHeader(token))
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/customers')
        .expect(401);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return customer by id', async () => {
      const res = await request(testApp.app.getHttpServer())
        .get(`/api/customers/${seed.customer1Id}`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.id).toBe(seed.customer1Id);
      expect(res.body.name).toBe('Maria Souza');
    });

    it('should return 404 for non-existent customer', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/customers/00000000-0000-0000-0000-000000000000')
        .set(authHeader(token))
        .expect(404);
    });
  });

  describe('PATCH /api/customers/:id', () => {
    it('should update customer', async () => {
      const res = await request(testApp.app.getHttpServer())
        .patch(`/api/customers/${seed.customer1Id}`)
        .set(authHeader(token))
        .send({ name: 'Maria Souza Updated' })
        .expect(200);

      expect(res.body.name).toBe('Maria Souza Updated');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should soft-delete customer', async () => {
      const created = await request(testApp.app.getHttpServer())
        .post('/api/customers')
        .set(authHeader(token))
        .send({
          name: 'To Delete',
          documentNumber: '37910493568',
          documentType: 'CPF',
          email: 'del@email.com',
          phone: '(11) 90000-0001',
        });

      await request(testApp.app.getHttpServer())
        .delete(`/api/customers/${created.body.id}`)
        .set(authHeader(token))
        .expect(204);

      await request(testApp.app.getHttpServer())
        .get(`/api/customers/${created.body.id}`)
        .set(authHeader(token))
        .expect(404);
    });
  });
});
