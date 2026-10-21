// import ServiceCatalogRepositoryInterface from '@service-orders/catalog/domain/contracts/service-catalog-repository.interface';
// import Service from '@service-orders/catalog/domain/entities/service.entity';
// import {
//   ServiceDTO,
//   CreateServiceInput,
//   UpdateServiceInput,
// } from '@service-orders/catalog/application/dtos/service.dtos';
// import { CreateServiceCatalogUseCase } from './create-service-catalog.use-case';
// import { ListServiceCatalogUseCase } from './list-service-catalog.use-case';
// import { FindByIdServiceCatalogUseCase } from './find-by-id-service-catalog.use-case';
// import { UpdateServiceCatalogUseCase } from './update-service-catalog.use-case';
// import { DeleteServiceCatalogUseCase } from './delete-service-catalog.use-case';

// export class ServiceCatalogUseCase {
//   constructor(
//   private readonly createUseCase: CreateServiceCatalogUseCase,
//     private readonly listUseCase: ListServiceCatalogUseCase,
//     private readonly findByIdUseCase: FindByIdServiceCatalogUseCase,
//     private readonly updateUseCase: UpdateServiceCatalogUseCase,
//     private readonly deleteUseCase: DeleteServiceCatalogUseCase,
//   ) {}

//   create(input: CreateServiceInput) { return this.createUseCase.execute(input); }
//   list() { return this.listUseCase.list(); }
//   findById(id: string) { return this.findByIdUseCase.findById(id); }
//   update(id: string, input: UpdateServiceInput) { return this.updateUseCase.update(id, input); }
//   delete(id: string) { return this.deleteUseCase.delete(id); }
// }
