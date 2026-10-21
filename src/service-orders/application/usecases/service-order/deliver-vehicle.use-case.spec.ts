import { Test, TestingModule } from '@nestjs/testing';
import { DeliverVehicleUseCase } from './deliver-vehicle.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

describe('DeliverVehicleUseCase', () => {
  let useCase: DeliverVehicleUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  const mockOrder: any = {
    id: 'order-1',
    status: ServiceOrderStatus.FINISHED,
    statusHistory: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DeliverVehicleUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new DeliverVehicleUseCase(repository),
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

    useCase = module.get(DeliverVehicleUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  it('should move from FINISHED to DELIVERED', async () => {
    repository.findById.mockResolvedValue(mockOrder);
    repository.update.mockResolvedValue({
      ...mockOrder,
      status: ServiceOrderStatus.DELIVERED,
    });
    repository.createStatusHistory.mockResolvedValue({} as any);

    await useCase.execute('order-1');

    expect(repository.update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.DELIVERED }),
    );
  });

  it('should throw if order not found', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
