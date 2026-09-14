import { Module } from '@nestjs/common';
import { PrismaModule } from '@/common/infra/prisma/prisma.module';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import AddMaterialStockUseCase from '@materials/application/usecases/add-material-stock.usecase';
import CreateMaterialUseCase from '@materials/application/usecases/create-material.usecase';
import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import UpdateMaterialUseCase from '@materials/application/usecases/update-material.usecase';
import MaterialRepositoryInterface from '@materials/domain/contracts/material-repository.interface';
import PrismaMaterialRepository from '@materials/infra/repositories/prisma-material.repository';
import { MaterialsInfraController } from '@materials/infra/controllers/materials.controller';
import AddMaterialStockController from '@materials/presentation/controllers/add-material-stock.controller';
import CreateMaterialController from '@materials/presentation/controllers/create-material.controller';
import DeleteMaterialController from '@materials/presentation/controllers/delete-material.controller';
import FindMaterialByIdController from '@materials/presentation/controllers/find-material-by-id.controller';
import ListMaterialsController from '@materials/presentation/controllers/list-materials.controller';
import UpdateMaterialController from '@materials/presentation/controllers/update-material.controller';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { EXCEPTION_STATUS_MAP } from '@/common/infra/filters/exception-status.map';
import { materialsStatusMap } from '@/materials/infra/filters/materials-status.map';
import { createProvider } from '@/common/infra/di/create-provider';

@Module({
  imports: [PrismaModule],
  controllers: [MaterialsInfraController],
  providers: [
    { provide: EXCEPTION_STATUS_MAP, useValue: materialsStatusMap },
    DomainExceptionFilter,
    {
      provide: MaterialRepositoryInterface,
      useClass: PrismaMaterialRepository,
    },
    {
      provide: PART_REPOSITORY,
      useExisting: MaterialRepositoryInterface,
    },
    createProvider(CreateMaterialUseCase, [MaterialRepositoryInterface]),
    createProvider(ListMaterialsUseCase, [MaterialRepositoryInterface]),
    createProvider(FindMaterialByIdUseCase, [MaterialRepositoryInterface]),
    createProvider(UpdateMaterialUseCase, [MaterialRepositoryInterface]),
    createProvider(AddMaterialStockUseCase, [MaterialRepositoryInterface]),
    createProvider(DeleteMaterialUseCase, [MaterialRepositoryInterface]),
    createProvider(CreateMaterialController, [CreateMaterialUseCase]),
    createProvider(ListMaterialsController, [ListMaterialsUseCase]),
    createProvider(FindMaterialByIdController, [FindMaterialByIdUseCase]),
    createProvider(UpdateMaterialController, [UpdateMaterialUseCase]),
    createProvider(AddMaterialStockController, [AddMaterialStockUseCase]),
    createProvider(DeleteMaterialController, [DeleteMaterialUseCase]),
  ],
  exports: [PART_REPOSITORY, MaterialRepositoryInterface],
})
export class MaterialsModule {}
