export function validateEnv(): void {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'PASSWORD_SALT',
    'WEBHOOK_SECRET',
  ];
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }
}

export function env(): {
  jwtSecret: string;
  port: number;
  databaseUrl: string;
  webhookSecret: string;
} {
  return {
    jwtSecret: process.env.JWT_SECRET!,
    port: parseInt(process.env.PORT ?? '3000', 10),
    databaseUrl: process.env.DATABASE_URL!,
    webhookSecret: process.env.WEBHOOK_SECRET!,
  };
}
