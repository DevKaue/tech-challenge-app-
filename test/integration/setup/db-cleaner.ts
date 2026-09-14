import { PrismaService } from '@/common/infra/prisma/prisma.service';

const TEST_DB_PATTERNS = ['_test', 'localhost', 'oficinadb_test'];

function guardProduction() {
  const url = process.env.DATABASE_URL ?? '';
  const isSafe = TEST_DB_PATTERNS.some((p) => url.includes(p));
  if (!isSafe) {
    throw new Error(
      `Refusing truncate: DATABASE_URL does not look like a test database.\n` +
        `  DATABASE_URL=${url}\n` +
        `  Expected pattern: one of ${TEST_DB_PATTERNS.map((p) => `"${p}"`).join(', ')}`,
    );
  }
}

const TABLES_IN_ORDER = [
  'estimate_items',
  'estimates',
  'service_order_status_history',
  'service_orders',
  'vehicles',
  'customers',
  'parts',
  'service_catalog',
  'users',
];

export async function truncateAll(prisma: PrismaService): Promise<void> {
  guardProduction();
  for (const table of TABLES_IN_ORDER) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`,
    );
  }
}
