import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import InMemoryCustomerRepository from '@/customer-management/infra/repositories/in-memory-customer.repository';
import CustomerRepositoryInterface from '@/customer-management/domain/contracts/customer-repository.interface';
import InMemoryVehicleRepository from '@/customer-management/infra/repositories/in-memory-vehicle.repository';
import VehicleRepositoryInterface from '@/customer-management/domain/contracts/vehicle-repository.interface';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { MockJwtAuthGuard } from '@test/common/guards/mock-jwt.guard';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/presentation/guards/roles.guard';

describe('Create Customer (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let memoryRepository: InMemoryCustomerRepository;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(CustomerRepositoryInterface)
      .useClass(InMemoryCustomerRepository)
      .overrideProvider(VehicleRepositoryInterface)
      .useClass(InMemoryVehicleRepository)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = module.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.setGlobalPrefix('api');
    await app.init();

    memoryRepository = module.get(CustomerRepositoryInterface);
  });

  afterAll(async () => {
    await app.close();
    await module.close();
  });

  afterEach(() => {
    // Clear the in-memory repository after each test
    if (memoryRepository && 'customers' in memoryRepository) {
      (memoryRepository as any).customers = [];
    }
  });

  describe('POST /api/customers', () => {
    it('should return 409 when trying to create a customer with duplicate document', async () => {
      const documentNumber = '52998224725'; // Known valid CPF
      const firstCustomerInput = {
        document_type: 'CPF',
        document_number: documentNumber,
        name: 'Maria Test',
        phone: '(11) 91111-2222',
        email: 'maria.test@email.com',
      };

      // Create first customer
      await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(firstCustomerInput)
        .expect(201);

      // Try to create another with same document
      const secondCustomerInput = {
        ...firstCustomerInput,
        email: 'maria.test2@email.com',
      };

      await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(secondCustomerInput)
        .expect(409);
    });

    it('should return 400 when documentType is missing', async () => {
      const createCustomerInput = {
        document_number: '52998224725',
        name: 'Ana Silva',
        phone: '(11) 99999-8888',
        email: 'ana.silva@email.com',
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createCustomerInput);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 when email is invalid', async () => {
      const createCustomerInput = {
        document_type: 'CPF',
        document_number: '52998224725',
        name: 'teste',
        phone: '(11) 99999-5555',
        email: 'invalid-email',
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createCustomerInput);

      expect(res.status).toBe(400);
    });

    it('should return 403 when user does not have ATTENDANT role', async () => {
      const createCustomerInput = {
        document_type: 'CPF',
        document_number: '52998224725',
        name: 'teste',
        phone: '(11) 99999-2222',
        email: 'test@email.com',
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.MECHANIC)
        .send(createCustomerInput);

      expect(res.status).toBe(403);
    });

    it('should return 400 for invalid CPF', async () => {
      const createCustomerInput = {
        document_type: 'CPF',
        document_number: '11111111111', // Invalid CPF (all same digits)
        name: 'teste',
        phone: '(11) 99999-1111',
        email: 'test@email.com',
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createCustomerInput);

      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid CNPJ', async () => {
      const createCustomerInput = {
        document_type: 'CNPJ',
        document_number: '11111111111111', // Invalid CNPJ
        name: 'teste',
        phone: '(11) 99999-1111',
        email: 'test@email.com',
      };

      const res = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createCustomerInput);

      expect(res.status).toBe(400);
    });
  });
});
