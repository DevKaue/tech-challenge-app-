import {
  hashPassword,
  verifyPassword,
  ScryptPasswordHasher,
} from './scrypt-password-hasher';

describe('ScryptPasswordHasher', () => {
  it('should hash and verify a password', async () => {
    const hasher = new ScryptPasswordHasher();
    const passwordHash = await hasher.hash('Tech@123');

    await expect(hasher.verify('Tech@123', passwordHash)).resolves.toBe(true);
    await expect(hasher.verify('Wrong@123', passwordHash)).resolves.toBe(false);
  });

  it('should expose helper functions for seed scripts', async () => {
    const passwordHash = await hashPassword('Tech@123');

    await expect(verifyPassword('Tech@123', passwordHash)).resolves.toBe(true);
  });
});
