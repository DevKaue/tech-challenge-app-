import { Module, OnModuleInit } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { HttpResponseInterceptor } from './common/presentation/interceptors/http-response.interceptor';
import { AppService } from './app.service';
import { MaterialsModule } from './materials/infra/materials.module';
import { CustomerManagementModule } from './customer-management/infra/customer-management.module';
import { PrismaModule } from './common/infra/prisma/prisma.module';
import { ServiceOrdersModule } from './service-orders/service-orders.module';
import { AccessIdentityModule } from './access-identity/access-identity.module';
import { validateEnv } from './common/infra/config/env';

@Module({
  imports: [
    MaterialsModule,
    CustomerManagementModule,
    PrismaModule,
    ServiceOrdersModule,
    AccessIdentityModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registrado no módulo, e não via useGlobalInterceptors, para valer também
    // nos testes que montam a aplicação a partir do AppModule.
    { provide: APP_INTERCEPTOR, useClass: HttpResponseInterceptor },
  ],
})
export class AppModule implements OnModuleInit {
  onModuleInit() {
    validateEnv();
  }
}
