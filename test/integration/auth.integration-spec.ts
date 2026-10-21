import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, closeTestApp, TestApp } from './setup/app.helper';
import { seedTestData, SeedData } from './setup/seed.helper';
import { loginAsAttendant, authHeader } from './setup/auth.helper';
import { PrismaService } from '@/common/infra/prisma/prisma.service';

describe('Auth (e2e)', () => {
  let testApp: TestApp;
  let prisma: PrismaService;
  let seed: SeedData;

  beforeAll(async () => {
    testApp = await createTestApp();
    prisma = testApp.prisma;
    seed = await seedTestData(prisma);
  });

  afterAll(async () => {
    await closeTestApp(testApp);
  });

  describe('POST /api/auth/login', () => {
    it('should return access_token for valid credentials', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ana.test@oficina.com', password: 'Tech@123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('ana.test@oficina.com');
      expect(res.body.user.role).toBe('ATTENDANT');
      expect(typeof res.body.access_token).toBe('string');
      expect(res.body.access_token.length).toBeGreaterThan(0);
    });

    it('should return 401 for invalid email', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'wrong@email.com', password: 'Tech@123' })
        .expect(401);
    });

    it('should return 401 for invalid password', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'ana.test@oficina.com', password: 'WrongPass' })
        .expect(401);
    });
  });

  describe('POST /api/auth/login-admin', () => {
    it('should return access_token for ATTENDANT role', async () => {
      const res = await request(testApp.app.getHttpServer())
        .post('/api/auth/login-admin')
        .send({ email: 'ana.test@oficina.com', password: 'Tech@123' })
        .expect(201);

      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.role).toBe('ATTENDANT');
    });

    it('should return 403 for MECHANIC role', async () => {
      await request(testApp.app.getHttpServer())
        .post('/api/auth/login-admin')
        .send({ email: 'joao.test@oficina.com', password: 'Tech@123' })
        .expect(403);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user when authenticated', async () => {
      const { token } = await loginAsAttendant(testApp.app);

      const res = await request(testApp.app.getHttpServer())
        .get('/api/auth/me')
        .set(authHeader(token))
        .expect(200);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toBe('ana.test@oficina.com');
      expect(res.body.role).toBe('ATTENDANT');
    });

    it('should return 401 without token', async () => {
      await request(testApp.app.getHttpServer())
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
