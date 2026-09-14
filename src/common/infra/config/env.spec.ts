import { validateEnv, env } from './env';

describe('env', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe('validateEnv', () => {
    it('passes when all required vars are present', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.JWT_SECRET = 'secret';
      process.env.WEBHOOK_SECRET = 'webhook-secret';
      expect(() => validateEnv()).not.toThrow();
    });

    it('throws when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      process.env.JWT_SECRET = 'secret';
      process.env.WEBHOOK_SECRET = 'webhook-secret';
      expect(() => validateEnv()).toThrow('DATABASE_URL');
    });

    it('throws when JWT_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      delete process.env.JWT_SECRET;
      process.env.WEBHOOK_SECRET = 'webhook-secret';
      expect(() => validateEnv()).toThrow('JWT_SECRET');
    });

    it('throws when WEBHOOK_SECRET is missing', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.JWT_SECRET = 'secret';
      delete process.env.WEBHOOK_SECRET;
      expect(() => validateEnv()).toThrow('WEBHOOK_SECRET');
    });

    it('throws with both missing vars listed', () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      process.env.WEBHOOK_SECRET = 'webhook-secret';
      expect(() => validateEnv()).toThrow(
        /DATABASE_URL.*JWT_SECRET|JWT_SECRET.*DATABASE_URL/,
      );
    });
  });

  describe('env()', () => {
    it('returns env values', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.JWT_SECRET = 'mysecret';
      process.env.PORT = '4000';
      process.env.WEBHOOK_SECRET = 'webhook-secret';

      const result = env();
      expect(result.databaseUrl).toBe('postgresql://localhost:5432/db');
      expect(result.jwtSecret).toBe('mysecret');
      expect(result.port).toBe(4000);
      expect(result.webhookSecret).toBe('webhook-secret');
    });

    it('defaults port to 3000 when not set', () => {
      process.env.DATABASE_URL = 'postgresql://localhost:5432/db';
      process.env.JWT_SECRET = 'mysecret';
      delete process.env.PORT;

      const result = env();
      expect(result.port).toBe(3000);
    });
  });
});
