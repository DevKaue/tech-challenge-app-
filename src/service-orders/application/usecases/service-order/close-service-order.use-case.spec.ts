import { Test, TestingModule } from '@nestjs/testing';
import { CloseServiceOrderUseCase } from './close-service-order.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

describe('CloseServiceOrderUseCase', () => {
  let useCase: CloseServiceOrderUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder = {
    id: 'order-1',
    customerId: 'client-1',
    vehicleId: 'vehicle-1',
    status: ServiceOrderStatus.DELIVERED,
    mileage: null,
    notes: null,
    mechanicId: null,
    mechanic: null,
    closedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CloseServiceOrderUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new CloseServiceOrderUseCase(repository),
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

    useCase = module.get(CloseServiceOrderUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should move from DELIVERED to CLOSED', async () => {
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.CLOSED,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    await useCase.execute('order-1');

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({
        status: ServiceOrderStatus.CLOSED,
      }),
    );
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
