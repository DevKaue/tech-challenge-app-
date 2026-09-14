import { Test, TestingModule } from '@nestjs/testing';
import { FindOneServiceOrderUseCase } from './find-one-service-order.use-case';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

describe('FindOneServiceOrderUseCase', () => {
  let useCase: FindOneServiceOrderUseCase;
  let queryService: jest.Mocked<ServiceOrderQueryServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindOneServiceOrderUseCase,
          useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
            new FindOneServiceOrderUseCase(queryService),
          inject: [ServiceOrderQueryServiceInterface],
        },
        {
          provide: ServiceOrderQueryServiceInterface,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(FindOneServiceOrderUseCase);
    queryService = module.get(ServiceOrderQueryServiceInterface);
  });

  it('should return the order from query service', async () => {
    const detail: ServiceOrderDetailDto = {
      id: 'order-1',
      status: ServiceOrderStatus.RECEIVED,
      mileage: null,
      notes: null,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      customer: {
        id: 'client-1',
        document: '123',
        name: 'Client',
        email: null,
        phone: null,
      },
      vehicle: {
        id: 'vehicle-1',
        plate: 'ABC-123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        customerId: 'client-1',
      },
      mechanic: null,
      estimates: [],
      statusHistory: [],
    };
    queryService.findOne.mockResolvedValue(detail);

    const result = await useCase.execute('order-1');

    expect(result).toHaveProperty('id', 'order-1');
  });

  it('should throw if not found', async () => {
    queryService.findOne.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
