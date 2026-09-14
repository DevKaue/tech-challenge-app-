import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import PrismaUnitOfWorkService from '@/common/infra/services/prisma-unit-of-work.service';
import UnitOfWorkServiceInterface from '@/common/application/contracts/unit-of-work-service.interface';

@Global()
@Module({
  providers: [
    PrismaService,
    PrismaUnitOfWorkService,
    {
      provide: UnitOfWorkServiceInterface,
      useClass: PrismaUnitOfWorkService,
    },
  ],
  exports: [PrismaService, PrismaUnitOfWorkService, UnitOfWorkServiceInterface],
})
export class PrismaModule {}
