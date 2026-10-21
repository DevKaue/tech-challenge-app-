import { Test, TestingModule } from '@nestjs/testing';
import { UpdateEstimateStatusUseCase } from './update-estimate-status.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';
import { PART_REPOSITORY } from '@service-orders/domain/acls/part-repository.interface';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

describe('UpdateEstimateStatusUseCase', () => {
  let useCase: UpdateEstimateStatusUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;
  let partRepository: { incrementStock: jest.Mock };

  const mockOrder: any = {
    id: 'order-1',
    status: ServiceOrderStatus.WAITING_APPROVAL,
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    partRepository = { incrementStock: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UpdateEstimateStatusUseCase,
          useFactory: (
            repository: ServiceOrdersRepositoryInterface,
            partRepository: { incrementStock: jest.Mock },
          ) => new UpdateEstimateStatusUseCase(repository, partRepository),
          inject: [ServiceOrdersRepositoryInterface, PART_REPOSITORY],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findEstimateById: jest.fn(),
            updateEstimateStatus: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
        { provide: PART_REPOSITORY, useValue: partRepository },
      ],
    }).compile();

    useCase = module.get(UpdateEstimateStatusUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should approve estimate and move OS to IN_EXECUTION', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue({
      ...mockEstimate,
      status: EstimateStatus.APPROVED,
    });
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
    });

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.APPROVED,
    });

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_EXECUTION }),
    );
    expect(result).toHaveProperty('status', EstimateStatus.APPROVED);
  });

  it('should handle negotiated status without transitioning OS', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.NEGOTIATED,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue(mockEstimate);

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.NEGOTIATED,
    });

    expect(repository.update).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.NEGOTIATED);
  });

  it('should be idempotent when estimate already has the target status (APPROVED)', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.APPROVED,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.APPROVED,
    });

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
    expect(repository.update).not.toHaveBeenCalled();
    expect(repository.createStatusHistory).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.APPROVED);
  });

  it('should be idempotent when estimate already has the target status (REJECTED)', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.REJECTED,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    const result = await useCase.execute('est-1', {
      status: EstimateStatus.REJECTED,
    });

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
    expect(result).toHaveProperty('status', EstimateStatus.REJECTED);
  });

  it('should throw when trying to change an already APPROVED estimate', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.APPROVED,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.REJECTED }),
    ).rejects.toThrow(InvalidStatusTransitionException);

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
  });

  it('should reject estimate, return OS to diagnosis and restore parts', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      items: [
        {
          itemType: ServiceOrderItemType.PART,
          referenceId: 'part-1',
          quantity: 2,
        },
      ],
    } as any;
    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue({
      ...mockEstimate,
      status: EstimateStatus.REJECTED,
    });
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    });

    const result = await useCase.execute(
      'est-1',
      { status: EstimateStatus.REJECTED, reason: 'Too expensive' },
      'external-notification',
    );

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_DIAGNOSIS }),
    );
    expect(partRepository.incrementStock).toHaveBeenCalledWith('part-1', 2);
    expect(repository.createStatusHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        changedBy: 'external-notification',
        notes: 'Too expensive',
      }),
    );
    expect(result.status).toBe(EstimateStatus.REJECTED);
  });

  it('should throw if service order not found after approve', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue(mockEstimate);
    repository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.APPROVED }),
    ).rejects.toThrow(ServiceOrderNotFoundException);
  });

  it('should throw when order status is invalid for approve', async () => {
    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      items: [],
    } as any;

    repository.findEstimateById.mockResolvedValue(mockEstimate);
    repository.updateEstimateStatus.mockResolvedValue(mockEstimate);
    repository.findById.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.RECEIVED,
    });

    await expect(
      useCase.execute('est-1', { status: EstimateStatus.APPROVED }),
    ).rejects.toThrow(InvalidStatusTransitionException);
  });

  it('should throw when estimate is not found', async () => {
    repository.findEstimateById.mockResolvedValue(null);

    await expect(
      useCase.execute('missing-estimate', {
        status: EstimateStatus.APPROVED,
      }),
    ).rejects.toThrow(EstimateNotFoundException);

    expect(repository.updateEstimateStatus).not.toHaveBeenCalled();
  });
});
