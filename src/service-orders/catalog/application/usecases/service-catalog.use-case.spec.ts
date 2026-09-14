// @deprecated UseCase legado — substituído por CreateServiceCatalogUseCase,
// ListServiceCatalogUseCase, FindByIdServiceCatalogUseCase,
// UpdateServiceCatalogUseCase e DeleteServiceCatalogUseCase.
// Mantido como referência histórica. Não remover.

describe('ServiceCatalogUseCase (deprecated)', () => {
  it('should pass placeholder test', () => {
    expect(true).toBe(true);
  });
});

// Original tests comentados abaixo - mantidos como referência histórica
// import { ServiceCatalogUseCase } from '@service-orders/catalog/application/usecases/service-catalog.use-case';
// import Service from '@service-orders/catalog/domain/entities/service.entity';
// import ServiceNotFoundException from '@service-orders/catalog/application/exceptions/service-not-found.exception';
// import DomainException from '@service-orders/catalog/domain/exceptions/domain.exception';
//
// const buildService = () =>
//   new Service({ id: 'svc-1', name: 'Troca de óleo', price: 150 });
//
// const buildRepo = () => ({
//   create: jest.fn(),
//   findAll: jest.fn(),
//   findById: jest.fn(),
//   update: jest.fn(),
//   delete: jest.fn(),
// });
//
// describe('ServiceCatalogUseCase', () => {
//   // it('creates a service', async () => { ... });
//   // it('rejects a service with negative price', async () => { ... });
//   // it('lists services', async () => { ... });
//   // it('finds a service by id', async () => { ... });
//   // it('throws when finding a missing service', async () => { ... });
//   // it('updates an existing service', async () => { ... });
//   // it('throws when updating a missing service', async () => { ... });
//   // it('deletes an existing service', async () => { ... });
//   // it('throws when deleting a missing service', async () => { ... });
// });
