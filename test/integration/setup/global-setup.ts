import { execSync } from 'child_process';

export default async function globalSetup(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is required for integration tests');
  }

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: { ...process.env },
  });
}
