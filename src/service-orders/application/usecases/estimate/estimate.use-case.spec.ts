// @deprecated UseCase legado — substituído por CreateEstimateUseCase,
// AddEstimateItemUseCase, RejectEstimateUseCase e UpdateEstimateStatusUseCase.
// Mantido como referência histórica. Não remover.

import { Test, TestingModule } from '@nestjs/testing';

describe('EstimateUseCase (deprecated)', () => {
  it('should pass placeholder test', () => {
    expect(true).toBe(true);
  });
});

// Original tests comentados abaixo - mantidos como referência histórica
// import { Test, TestingModule } from '@nestjs/testing';
// import { EstimateUseCase } from './estimate.use-case';
// import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
// import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
// import { SERVICE_CATALOG_REPOSITORY } from '@service-orders/domain/acls/service-catalog-repository.interface';
// import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
// import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
// import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
// import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
// import { ServiceCatalogNotFoundException } from '@service-orders/application/exceptions/service-catalog-not-found.exception';
// import { PartNotFoundException } from '@service-orders/application/exceptions/part-not-found.exception';
// import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
//
// describe('EstimateUseCase', () => { ... });
