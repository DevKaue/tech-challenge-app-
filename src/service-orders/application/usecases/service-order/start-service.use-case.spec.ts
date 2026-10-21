import { Test, TestingModule } from '@nestjs/testing';
import { StartServiceUseCase } from './start-service.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

describe('StartServiceUseCase', () => {
  let useCase: StartServiceUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder: any = {
    id: 'order-1',
    status: ServiceOrderStatus.RECEIVED,
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: StartServiceUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new StartServiceUseCase(repository),
          inject: [ServiceOrdersRepositoryInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            createStatusHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(StartServiceUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should move from WAITING_APPROVAL to IN_EXECUTION', async () => {
    const waitingApproval = {
      ...mockOrder,
      status: ServiceOrderStatus.WAITING_APPROVAL,
    };
    repository.findById.mockResolvedValue(waitingApproval);
    repository.update.mockResolvedValue({
      ...waitingApproval,
      status: ServiceOrderStatus.IN_EXECUTION,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    const result = await useCase.execute('order-1');

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_EXECUTION }),
    );
    expect(result).toBeDefined();
  });

  it('should throw if status is not WAITING_APPROVAL', async () => {
    repository.findById.mockResolvedValue(mockOrder);

    await expect(useCase.execute('order-1')).rejects.toThrow(
      InvalidStatusTransitionException,
    );
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
