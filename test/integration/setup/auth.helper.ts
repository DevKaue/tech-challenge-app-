import { INestApplication } from '@nestjs/common';
import request from 'supertest';

const TEST_PASSWORD = 'Tech@123';

export async function loginAsAttendant(app: INestApplication): Promise<{
  token: string;
  userId: string;
}> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login-admin')
    .send({ email: 'ana.test@oficina.com', password: TEST_PASSWORD })
    .expect(201);

  return {
    token: res.body.access_token,
    userId: res.body.user.id,
  };
}

export async function loginAsMechanic(app: INestApplication): Promise<{
  token: string;
  userId: string;
}> {
  const res = await request(app.getHttpServer())
    .post('/api/auth/login')
    .send({ email: 'joao.test@oficina.com', password: TEST_PASSWORD })
    .expect(201);

  return {
    token: res.body.access_token,
    userId: res.body.user.id,
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
