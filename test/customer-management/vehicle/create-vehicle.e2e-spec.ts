import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '@/app.module';
import InMemoryVehicleRepository from '@/customer-management/infra/repositories/in-memory-vehicle.repository';
import InMemoryCustomerRepository from '@/customer-management/infra/repositories/in-memory-customer.repository';
import VehicleRepositoryInterface from '@/customer-management/domain/contracts/vehicle-repository.interface';
import CustomerRepositoryInterface from '@/customer-management/domain/contracts/customer-repository.interface';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { MockJwtAuthGuard } from '@test/common/guards/mock-jwt.guard';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@/access-identity/presentation/guards/roles.guard';
import Customer from '@/customer-management/domain/entities/customer.entity';
import Document from '@/customer-management/domain/value-objects/document.vo';
import { DocumentType } from '@/customer-management/domain/enums/document-type.enum';

describe('Create Vehicle (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let vehicleRepository: InMemoryVehicleRepository;
  let customerRepository: InMemoryCustomerRepository;
  let customerId: string;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(VehicleRepositoryInterface)
      .useClass(InMemoryVehicleRepository)
      .overrideProvider(CustomerRepositoryInterface)
      .useClass(InMemoryCustomerRepository)
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

    vehicleRepository = module.get(VehicleRepositoryInterface);
    customerRepository = module.get(CustomerRepositoryInterface);

    // Create a test customer for vehicle creation
    const testCustomer = new Customer({
      id: 'customer-123',
      document: new Document(DocumentType.CPF, '52998224725'),
      name: 'Test Customer',
      phone: '(11) 99999-9999',
      email: 'customer@test.com',
    });

    await customerRepository.create(testCustomer);
    customerId = testCustomer.id;
  });

  afterAll(async () => {
    await app.close();
    await module.close();
  });

  afterEach(() => {
    // Clear the in-memory repository after each test
    if (vehicleRepository && 'vehicles' in vehicleRepository) {
      (vehicleRepository as any).vehicles = [];
    }
  });

  describe('POST /api/customers/:customerId/vehicles', () => {
    it('should successfully create a vehicle', async () => {
      const createVehicleInput = {
        license_plate: 'ABC-1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
      };

      const res = await request(app.getHttpServer())
        .post(`/api/customers/${customerId}/vehicles`)
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createVehicleInput);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('license_plate');
      expect(res.body).toHaveProperty('brand', 'Toyota');
      expect(res.body).toHaveProperty('model', 'Corolla');
      expect(res.body).toHaveProperty('year', 2023);
    });

    it('should return 409 when trying to create a vehicle with duplicate license plate', async () => {
      const licensePlate = 'XYZ-9999';
      const firstVehicleInput = {
        license_plate: licensePlate,
        brand: 'Honda',
        model: 'Civic',
        year: 2022,
      };

      // Create first vehicle
      await request(app.getHttpServer())
        .post(`/api/customers/${customerId}/vehicles`)
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(firstVehicleInput)
        .expect(201);

      // Try to create another with same license plate
      const secondVehicleInput = {
        ...firstVehicleInput,
        brand: 'Hyundai', // Different brand but same plate
      };

      await request(app.getHttpServer())
        .post(`/api/customers/${customerId}/vehicles`)
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(secondVehicleInput)
        .expect(409);
    });

    it('should return 400 when license_plate is invalid', async () => {
      const createVehicleInput = {
        license_plate: 'INVALID-PLATE-123456', // Too long/invalid format
        brand: 'Ford',
        model: 'Fusion',
        year: 2021,
      };

      const res = await request(app.getHttpServer())
        .post(`/api/customers/${customerId}/vehicles`)
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createVehicleInput);

      expect(res.status).toBe(400);
    });

    it('should return 404 when customer does not exist', async () => {
      const createVehicleInput = {
        license_plate: 'MNO-9999',
        brand: 'Audi',
        model: 'A4',
        year: 2023,
      };

      const nonExistentCustomerId = 'non-existent-customer-id';

      const res = await request(app.getHttpServer())
        .post(`/api/customers/${nonExistentCustomerId}/vehicles`)
        .set('Authorization', `Bearer valid-token`)
        .set('X-User-Role', UserRole.ATTENDANT)
        .send(createVehicleInput);

      expect(res.status).toBe(404);
    });
  });
});
