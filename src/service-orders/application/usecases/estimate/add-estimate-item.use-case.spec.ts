import { Test } from '@nestjs/testing';
import { ServiceOrdersRepositoryInterface } from '@/service-orders/domain/contracts/service-orders-repository.interface';
import { AddEstimateItemUseCase } from './add-estimate-item.use-case';
import { ServiceOrderItemType } from '@/service-orders/domain/enums/service-order-item-type.enum';
import { PART_REPOSITORY } from '@/service-orders/domain/acls/part-repository.interface';
import { SERVICE_CATALOG_REPOSITORY } from '@/service-orders/domain/acls/service-catalog-repository.interface';
import {
  PartNotFoundException,
  ServiceCatalogNotFoundException,
  InsufficientStockException,
} from '../../exceptions';

describe('addEstimateItem', () => {
  it('should add an item', async () => {
    const mockServiceCatalogRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 'svc-1',
        name: 'Troca de oleo',
        price: 150,
        description: 'Troca de oleo completa',
      }),
    };

    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AddEstimateItemUseCase,
          useFactory: (
            repository: any,
            partRepository: any,
            serviceCatalogRepository?: any,
          ) =>
            new AddEstimateItemUseCase(
              repository,
              partRepository,
              serviceCatalogRepository,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            PART_REPOSITORY,
            SERVICE_CATALOG_REPOSITORY,
          ],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn().mockResolvedValue({
              id: 'item-1',
              estimateId: 'est-1',
              itemType: ServiceOrderItemType.SERVICE,
              referenceId: 'svc-1',
              description: 'Troca de oleo',
              quantity: 1,
              unitPrice: 150,
              totalPrice: 150,
              notes: null,
            }),
            updateEstimateStatus: jest.fn(),
            recalcEstimateTotal: jest.fn(),
          },
        },
        { provide: PART_REPOSITORY, useValue: {} },
        {
          provide: SERVICE_CATALOG_REPOSITORY,
          useValue: mockServiceCatalogRepo,
        },
      ],
    }).compile();

    const uc = module.get(AddEstimateItemUseCase);
    const repo = module.get(ServiceOrdersRepositoryInterface);

    const result = await uc.execute('est-1', {
      itemType: ServiceOrderItemType.SERVICE,
      referenceId: 'svc-1',
      description: 'Troca de oleo',
      quantity: 1,
    });

    expect(repo.addEstimateItem).toHaveBeenCalledWith(
      expect.objectContaining({ unitPrice: 150, totalPrice: 150 }),
    );
    expect(result).toHaveProperty('id', 'item-1');
  });

  it('should throw if service not found in catalog', async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AddEstimateItemUseCase,
          useFactory: (
            repository: any,
            partRepository: any,
            serviceCatalogRepository?: any,
          ) =>
            new AddEstimateItemUseCase(
              repository,
              partRepository,
              serviceCatalogRepository,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            PART_REPOSITORY,
            SERVICE_CATALOG_REPOSITORY,
          ],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn(),
            updateEstimateStatus: jest.fn(),
          },
        },
        { provide: PART_REPOSITORY, useValue: {} },
        {
          provide: SERVICE_CATALOG_REPOSITORY,
          useValue: { findById: jest.fn().mockResolvedValue(null) },
        },
      ],
    }).compile();

    const uc = module.get(AddEstimateItemUseCase);
    await expect(
      uc.execute('est-1', {
        itemType: ServiceOrderItemType.SERVICE,
        referenceId: 'invalid',
        quantity: 1,
      }),
    ).rejects.toThrow(ServiceCatalogNotFoundException);
  });

  it('should throw if part stock is insufficient', async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AddEstimateItemUseCase,
          useFactory: (
            repository: any,
            partRepository: any,
            serviceCatalogRepository?: any,
          ) =>
            new AddEstimateItemUseCase(
              repository,
              partRepository,
              serviceCatalogRepository,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            PART_REPOSITORY,
            SERVICE_CATALOG_REPOSITORY,
          ],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn(),
            updateEstimateStatus: jest.fn(),
          },
        },
        {
          provide: PART_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue({
              id: 'part-1',
              name: 'Oleo',
              price: 100,
              stockQuantity: 2,
            }),
            decrementStock: jest.fn(),
          },
        },
        { provide: SERVICE_CATALOG_REPOSITORY, useValue: {} },
      ],
    }).compile();

    const uc = module.get(AddEstimateItemUseCase);
    await expect(
      uc.execute('est-1', {
        itemType: ServiceOrderItemType.PART,
        referenceId: 'part-1',
        quantity: 5,
      }),
    ).rejects.toThrow(InsufficientStockException);
  });

  it('should throw if part not found', async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AddEstimateItemUseCase,
          useFactory: (
            repository: any,
            partRepository: any,
            serviceCatalogRepository?: any,
          ) =>
            new AddEstimateItemUseCase(
              repository,
              partRepository,
              serviceCatalogRepository,
            ),
          inject: [
            ServiceOrdersRepositoryInterface,
            PART_REPOSITORY,
            SERVICE_CATALOG_REPOSITORY,
          ],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
            createEstimate: jest.fn(),
            addEstimateItem: jest.fn(),
            updateEstimateStatus: jest.fn(),
          },
        },
        {
          provide: PART_REPOSITORY,
          useValue: {
            findById: jest.fn().mockResolvedValue(null),
            decrementStock: jest.fn(),
          },
        },
        { provide: SERVICE_CATALOG_REPOSITORY, useValue: {} },
      ],
    }).compile();

    const uc = module.get(AddEstimateItemUseCase);
    await expect(
      uc.execute('est-1', {
        itemType: ServiceOrderItemType.PART,
        referenceId: 'invalid',
        quantity: 1,
      }),
    ).rejects.toThrow(PartNotFoundException);
  });
});
