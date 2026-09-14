import { Test, TestingModule } from '@nestjs/testing';
import { RejectEstimateUseCase } from './reject-estimate.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

describe('RejectEstimateUseCase', () => {
  let useCase: RejectEstimateUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let partRepository: { incrementStock: jest.Mock };

  const mockOrder: any = {
    id: 'order-1',
    status: ServiceOrderStatus.WAITING_APPROVAL,
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    partRepository = {
      incrementStock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RejectEstimateUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            partRepository: { incrementStock: jest.Mock },
          ) => new RejectEstimateUseCase(repository, partRepository),
          inject: [ServiceOrdersRepositoryInterface, PART_REPOSITORY],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            updateEstimateStatus: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
        { provide: PART_REPOSITORY, useValue: partRepository },
      ],
    }).compile();

    useCase = module.get(RejectEstimateUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should move OS back to IN_DIAGNOSIS with reason', async () => {
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    });

    await useCase.execute('order-1', { reason: 'Too expensive' });

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_DIAGNOSIS }),
    );
    expect(repository.createStatusHistory).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Too expensive' }),
    );
  });

  it('should restock PART items when rejecting', async () => {
    const orderWithEstimate = {
      ...mockOrder,
      estimates: [
        {
          id: 'est-1',
          status: EstimateStatus.PENDING,
          items: [
            {
              itemType: ServiceOrderItemType.PART,
              referenceId: 'part-1',
              quantity: 3,
            },
            {
              itemType: ServiceOrderItemType.SERVICE,
              referenceId: 'svc-1',
              quantity: 1,
            },
          ],
        },
      ],
    };

    repository.findById.mockResolvedValue(orderWithEstimate);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    });

    await useCase.execute('order-1', { reason: 'Rejected' });

    expect(partRepository.incrementStock).toHaveBeenCalledTimes(1);
    expect(partRepository.incrementStock).toHaveBeenCalledWith('part-1', 3);
    expect(repository.updateEstimateStatus).toHaveBeenCalledWith(
      'est-1',
      EstimateStatus.REJECTED,
    );
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('invalid', { reason: 'No reason' }),
    ).rejects.toThrow(ServiceOrderNotFoundException);
  });

  it('should throw when status is not WAITING_APPROVAL', async () => {
    repository.findById.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.RECEIVED,
    });

    await expect(
      useCase.execute('order-1', { reason: 'test' }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });
});
