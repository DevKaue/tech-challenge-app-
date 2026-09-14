import { Test, TestingModule } from '@nestjs/testing';
import { GetServiceOrderStatusUseCase } from './get-service-order-status.use-case';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';

describe('GetServiceOrderStatusUseCase', () => {
  let useCase: GetServiceOrderStatusUseCase;
  let queryService: jest.Mocked<ServiceOrderQueryServiceInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetServiceOrderStatusUseCase,
          useFactory: (queryService: ServiceOrderQueryServiceInterface) =>
            new GetServiceOrderStatusUseCase(queryService),
          inject: [ServiceOrderQueryServiceInterface],
        },
        {
          provide: ServiceOrderQueryServiceInterface,
          useValue: {
            findStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(GetServiceOrderStatusUseCase);
    queryService = module.get(ServiceOrderQueryServiceInterface);
  });

  it('should return the current status from query service', async () => {
    const status: ServiceOrderStatusDto = {
      id: 'order-1',
      status: ServiceOrderStatus.IN_EXECUTION,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    queryService.findStatus.mockResolvedValue(status);

    const result = await useCase.execute('order-1');

    expect(result).toEqual(status);
  });

  it('should throw if the OS does not exist', async () => {
    queryService.findStatus.mockResolvedValue(null);

    await expect(useCase.execute('invalid')).rejects.toThrow(
      ServiceOrderNotFoundException,
    );
  });
});
