import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/access-identity/infra/security/scrypt-password-hasher';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const users = [
  {
    name: 'João Silva',
    role: 'MECHANIC' as const,
    email: 'joao.silva@oficina.com',
    phone: '(11) 99999-0001',
  },
  {
    name: 'Carlos Oliveira',
    role: 'MECHANIC' as const,
    email: 'carlos.oliveira@oficina.com',
    phone: '(11) 99999-0002',
  },
  {
    name: 'Ana Santos',
    role: 'ATTENDANT' as const,
    email: 'ana.santos@oficina.com',
    phone: '(11) 99999-0003',
  },
];
const defaultPassword = 'Tech@123';

const services = [
  {
    name: 'Troca de Óleo',
    description: 'Substituição do óleo do motor e filtro',
    price: 150,
  },
  {
    name: 'Alinhamento e Balanceamento',
    description: 'Alinhamento da direção e balanceamento das rodas',
    price: 120,
  },
  {
    name: 'Revisão Preventiva',
    description: 'Revisão completa de 20 itens do veículo',
    price: 280,
  },
  {
    name: 'Troca de Pastilhas de Freio',
    description: 'Substituição das pastilhas de freio dianteiras',
    price: 200,
  },
  {
    name: 'Troca de Correia Dentada',
    description: 'Substituição da correia dentada e tensionadores',
    price: 450,
  },
  {
    name: 'Diagnóstico Eletrônico',
    description: 'Escaneamento completo dos sistemas eletrônicos',
    price: 180,
  },
];

const parts = [
  {
    name: 'Óleo 5W30',
    description: 'Óleo lubrificante sintético 5W30',
    price: 45,
    type: 'SUPPLY' as const,
    stockQuantity: 20,
    stockUnit: 'LITER' as const,
  },
  {
    name: 'Filtro de Óleo',
    description: 'Filtro de óleo do motor',
    price: 35,
    type: 'PART' as const,
    stockQuantity: 15,
    stockUnit: 'UNIT' as const,
  },
  {
    name: 'Pastilha de Freio Dianteira',
    description: 'Jogo de pastilhas de freio para eixo dianteiro',
    price: 120,
    type: 'PART' as const,
    stockQuantity: 10,
    stockUnit: 'UNIT' as const,
  },
  {
    name: 'Correia Dentada',
    description: 'Correia de distribuição do motor',
    price: 180,
    type: 'PART' as const,
    stockQuantity: 8,
    stockUnit: 'UNIT' as const,
  },
  {
    name: 'Filtro de Ar',
    description: 'Filtro de ar do motor',
    price: 55,
    type: 'PART' as const,
    stockQuantity: 12,
    stockUnit: 'UNIT' as const,
  },
  {
    name: 'Velas de Ignição (4 un)',
    description: 'Jogo de 4 velas de ignição',
    price: 90,
    type: 'PART' as const,
    stockQuantity: 10,
    stockUnit: 'UNIT' as const,
  },
];

const customers = [
  {
    name: 'Empresa ABC Ltda',
    document: '11222333000181',
    documentType: 'CNPJ',
    email: 'contato@abc.com',
    phone: '(11) 3333-0100',
  },
  {
    name: 'Maria Souza',
    document: '52998224725',
    documentType: 'CPF',
    email: 'maria.souza@email.com',
    phone: '(11) 98888-0001',
  },
  {
    name: 'Pedro Almeida',
    document: '98765432100',
    documentType: 'CPF',
    email: 'pedro.almeida@email.com',
    phone: '(11) 97777-0002',
  },
] as const;

const vehicles = [
  {
    plate: 'ABC1A23',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    customerIndex: 1,
  },
  {
    plate: 'DEF2B34',
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    customerIndex: 0,
  },
  {
    plate: 'GHII3C45',
    brand: 'Volkswagen',
    model: 'T-Cross',
    year: 2023,
    customerIndex: 2,
  },
];

async function main() {
  console.log('Seeding database...');

  const seedEmails = users.map((u) => u.email.toLowerCase());
  const existingWithSeedEmails = await prisma.user.count({
    where: { email: { in: seedEmails } },
  });
  if (existingWithSeedEmails === users.length) {
    console.log('Seed already applied — skipping');
    return;
  }

  await prisma.vehicle.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.material.deleteMany();
  await prisma.serviceCatalog.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  for (const user of users) {
    await prisma.user.create({
      data: {
        ...user,
        email: user.email.toLowerCase(),
        passwordHash: await hashPassword(defaultPassword),
      },
    });
  }

  console.log('Creating service catalog...');
  for (const service of services) {
    await prisma.serviceCatalog.create({ data: service });
  }

  console.log('Creating parts...');
  for (const part of parts) {
    await prisma.material.create({ data: part });
  }

  console.log('Creating customers...');
  for (const customer of customers) {
    await prisma.customer.create({ data: customer });
  }

  console.log('Creating vehicles...');
  const createdCustomers = await prisma.customer.findMany({
    orderBy: { createdAt: 'asc' },
  });
  for (const vehicle of vehicles) {
    await prisma.vehicle.create({
      data: {
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        customerId: createdCustomers[vehicle.customerIndex].id,
      },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
