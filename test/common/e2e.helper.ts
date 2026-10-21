import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/presentation/guards/jwt-auth.guard';
import { MockJwtAuthGuard } from './guards/mock-jwt.guard';

/**
 * E2E Test Helper
 * Provides common utilities for e2e tests across all modules
 */
export class E2eTestHelper {
  /**
   * Creates a testing module with mock authentication guard
   *
   * Usage:
   * ```
   * const { app, module } = await E2eTestHelper.createTestingModule(
   *   AppModule,
   *   [
   *     { provide: CustomerRepositoryInterface, useClass: InMemoryCustomerRepository },
   *     { provide: VehicleRepositoryInterface, useClass: InMemoryVehicleRepository },
   *   ],
   * );
   * ```
   *
   * @param moduleClass - The main application module to import
   * @param overrideProviders - Array of providers to override [provide, useClass/useValue]
   * @returns Object containing the app instance and testing module
   */
  static async createTestingModule(
    moduleClass: any,
    overrideProviders: Array<{
      provide: any;
      useClass?: any;
      useValue?: any;
    }> = [],
  ): Promise<{
    app: INestApplication;
    module: TestingModule;
  }> {
    let moduleBuilder = Test.createTestingModule({
      imports: [moduleClass],
    });

    // Apply overrides for guards and providers
    moduleBuilder = moduleBuilder
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard);

    // Apply provider overrides
    for (const override of overrideProviders) {
      const { provide, useClass, useValue } = override;
      if (useClass) {
        moduleBuilder = moduleBuilder
          .overrideProvider(provide)
          .useClass(useClass);
      } else if (useValue) {
        moduleBuilder = moduleBuilder
          .overrideProvider(provide)
          .useValue(useValue);
      }
    }

    const module = await moduleBuilder.compile();

    const app = module.createNestApplication();
    await app.init();

    return { app, module };
  }

  /**
   * Cleans up after tests (closes app and module)
   *
   * Usage:
   * ```
   * afterAll(async () => {
   *   await E2eTestHelper.cleanupTestingModule(app, module);
   * });
   * ```
   */
  static async cleanupTestingModule(
    app: INestApplication,
    module: TestingModule,
  ): Promise<void> {
    await app.close();
    await module.close();
  }
}
