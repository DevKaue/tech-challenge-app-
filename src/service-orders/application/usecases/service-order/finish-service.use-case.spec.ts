import { Test, TestingModule } from '@nestjs/testing';
import { FinishServiceUseCase } from './finish-service.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

describe('FinishServiceUseCase', () => {
  let useCase: FinishServiceUseCase;
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
          provide: FinishServiceUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new FinishServiceUseCase(repository),
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

    useCase = module.get(FinishServiceUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should move from IN_EXECUTION to FINISHED', async () => {
    const inExecution = {
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
      mechanicId: 'user-1',
    };
    repository.findById.mockResolvedValue(inExecution);
    repository.update.mockResolvedValue({
      ...inExecution,
      status: ServiceOrderStatus.FINISHED,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    await useCase.execute('order-1', 'user-1');

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.FINISHED }),
    );
  });

  it('should pass notes to status history', async () => {
    const inExecution = {
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
      mechanicId: 'user-1',
    };
    repository.findById.mockResolvedValue(inExecution);
    repository.update.mockResolvedValue({
      ...inExecution,
      status: ServiceOrderStatus.FINISHED,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    await useCase.execute('order-1', 'user-1', 'Completed all repairs');

    expect(repository.createStatusHistory).toHaveBeenCalledWith(
      expect.objectContaining({ notes: 'Completed all repairs' }),
    );
  });

  it('should throw if not the assigned mechanic', async () => {
    const inExecution = {
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
      mechanicId: 'mechanic-A',
    };
    repository.findById.mockResolvedValue(inExecution);

    await expect(useCase.execute('order-1', 'mechanic-B')).rejects.toThrow(
      InvalidStatusTransitionException,
    );
  });

  it('should throw if no mechanic assigned', async () => {
    const inExecution = {
      ...mockOrder,
      status: ServiceOrderStatus.IN_EXECUTION,
      mechanicId: null,
    };
    repository.findById.mockResolvedValue(inExecution);

    await expect(useCase.execute('order-1', 'user-1')).rejects.toThrow(
      InvalidStatusTransitionException,
    );
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid', 'user-1')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
