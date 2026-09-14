import { Test, TestingModule } from '@nestjs/testing';
import { CreateEstimateUseCase } from './create-estimate.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

describe('CreateEstimateUseCase', () => {
  let useCase: CreateEstimateUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder: any = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.IN_DIAGNOSIS,
    createdAt: new Date(),
    updatedAt: new Date(),
    estimates: [],
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CreateEstimateUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new CreateEstimateUseCase(repository),
          inject: [ServiceOrdersRepositoryInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createEstimate: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(CreateEstimateUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should create estimate and move OS to WAITING_APPROVAL', async () => {
    repository.findById.mockResolvedValue(mockOrder);

    const mockEstimate = {
      id: 'est-1',
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      totalAmount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
    } as any;

    repository.createEstimate.mockResolvedValue(mockEstimate);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.WAITING_APPROVAL,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    const result = await useCase.execute('order-1');

    expect(repository.createEstimate).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      status: EstimateStatus.PENDING,
      totalAmount: 0,
    });
    expect(repository.update).toHaveBeenCalled();
    expect(repository.createStatusHistory).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      previousStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      newStatus: ServiceOrderStatus.WAITING_APPROVAL,
      changedBy: 'system',
      notes: 'Estimate generated',
    });
    expect(result).toHaveProperty('id', 'est-1');
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
