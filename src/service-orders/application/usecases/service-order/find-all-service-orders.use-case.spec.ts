import { Test, TestingModule } from '@nestjs/testing';
import { FindAllServiceOrdersUseCase } from './find-all-service-orders.use-case';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';

describe('FindAllServiceOrdersUseCase', () => {
  let useCase: FindAllServiceOrdersUseCase;
  let queryService: jest.Mocked<ServiceOrderQueryServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: FindAllServiceOrdersUseCase,
          useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
            new FindAllServiceOrdersUseCase(queryService),
          inject: [ServiceOrderQueryServiceInterface],
        },
        {
          provide: ServiceOrderQueryServiceInterface,
          useValue: {
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(FindAllServiceOrdersUseCase);
    queryService = module.get(ServiceOrderQueryServiceInterface);
  });

  it('should return all orders from query service', async () => {
    const summaries: ServiceOrderSummaryDto[] = [
      {
        id: 'order-1',
        status: ServiceOrderStatus.RECEIVED,
        mileage: null,
        notes: null,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        customer: { id: 'client-1', name: 'Client' },
        vehicle: {
          id: 'vehicle-1',
          plate: 'ABC-123',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
        },
        mechanic: null,
      },
    ];
    queryService.findAll.mockResolvedValue(summaries);

    const result = await useCase.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 'order-1');
  });
});
