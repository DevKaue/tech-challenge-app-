import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { hashPassword } from '@/access-identity/infra/security/scrypt-password-hasher';

export interface SeedData {
  attendantId: string;
  mechanic1Id: string;
  mechanic2Id: string;
  service1Id: string;
  service2Id: string;
  part1Id: string;
  part2Id: string;
  customer1Id: string;
  customer2Id: string;
  vehicle1Id: string;
  vehicle2Id: string;
}

const TEST_PASSWORD = 'Tech@123';

export async function seedTestData(prisma: PrismaService): Promise<SeedData> {
  const passwordHash = await hashPassword(TEST_PASSWORD);

  const [attendant, mechanic1, mechanic2] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ana Attendant',
        role: 'ATTENDANT',
        email: 'ana.test@oficina.com',
        passwordHash,
        phone: '(11) 99999-0001',
      },
    }),
    prisma.user.create({
      data: {
        name: 'João Mechanic',
        role: 'MECHANIC',
        email: 'joao.test@oficina.com',
        passwordHash,
        phone: '(11) 99999-0002',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Mechanic',
        role: 'MECHANIC',
        email: 'carlos.test@oficina.com',
        passwordHash,
        phone: '(11) 99999-0003',
      },
    }),
  ]);

  const [service1, service2] = await Promise.all([
    prisma.serviceCatalog.create({
      data: {
        name: 'Troca de Óleo',
        description: 'Substituição do óleo do motor',
        price: 150,
      },
    }),
    prisma.serviceCatalog.create({
      data: {
        name: 'Alinhamento',
        description: 'Alinhamento e balanceamento',
        price: 120,
      },
    }),
  ]);

  const [part1, part2] = await Promise.all([
    prisma.material.create({
      data: {
        name: 'Filtro de Óleo',
        description: 'Filtro de óleo do motor',
        price: 35,
        type: 'PART',
        stockQuantity: 15,
        stockUnit: 'UNIT',
      },
    }),
    prisma.material.create({
      data: {
        name: 'Óleo 5W30',
        description: 'Óleo lubrificante sintético',
        price: 45,
        type: 'SUPPLY',
        stockQuantity: 20,
        stockUnit: 'LITER',
      },
    }),
  ]);

  const [customer1, customer2] = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Maria Souza',
        document: '52998224725',
        documentType: 'CPF',
        email: 'maria.test@email.com',
        phone: '(11) 98888-0001',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Empresa ABC',
        document: '11222333000181',
        documentType: 'CNPJ',
        email: 'contato@abc.com',
        phone: '(11) 3333-0100',
      },
    }),
  ]);

  const [vehicle1, vehicle2] = await Promise.all([
    prisma.vehicle.create({
      data: {
        plate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: customer1.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        plate: 'DEF2E34',
        brand: 'Honda',
        model: 'Civic',
        year: 2021,
        customerId: customer2.id,
      },
    }),
  ]);

  return {
    attendantId: attendant.id,
    mechanic1Id: mechanic1.id,
    mechanic2Id: mechanic2.id,
    service1Id: service1.id,
    service2Id: service2.id,
    part1Id: part1.id,
    part2Id: part2.id,
    customer1Id: customer1.id,
    customer2Id: customer2.id,
    vehicle1Id: vehicle1.id,
    vehicle2Id: vehicle2.id,
  };
}
