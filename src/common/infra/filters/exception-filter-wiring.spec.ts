import { Test } from '@nestjs/testing';
import { AppModule } from '@/app.module';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { MaterialsModule } from '@/materials/infra/materials.module';
import { CustomerManagementModule } from '@/customer-management/infra/customer-management.module';
import { ServiceOrdersModule } from '@/service-orders/service-orders.module';
import { AccessIdentityModule } from '@/access-identity/access-identity.module';

describe('DomainExceptionFilter wiring', () => {
  it('compiles AppModule and resolves the filter from every module injector', async () => {
    process.env.DATABASE_URL ??= 'postgresql://localhost:5432/noop';
    process.env.JWT_SECRET ??= 'test-secret';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn(), $disconnect: jest.fn() })
      .compile();

    for (const mod of [
      MaterialsModule,
      CustomerManagementModule,
      ServiceOrdersModule,
      AccessIdentityModule,
    ]) {
      const filter = moduleRef.select(mod).get(DomainExceptionFilter);
      expect(filter).toBeInstanceOf(DomainExceptionFilter);
    }

    await moduleRef.close();
  });
});
