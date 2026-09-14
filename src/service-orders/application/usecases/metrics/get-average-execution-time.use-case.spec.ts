import { Test, TestingModule } from '@nestjs/testing';
//import { MetricsUseCase } from './get-avetage-execution-time.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { GetAverageExecutionTimeUseCase } from './get-avetage-execution-time.use-case';

describe('GetAverageExecutionTimeUseCase', () => {
  let useCase: GetAverageExecutionTimeUseCase;
  let repository: jest.Mocked<ServiceOrdersRepositoryInterface>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GetAverageExecutionTimeUseCase,
          useFactory: (repository: ServiceOrdersRepositoryInterface) =>
            new GetAverageExecutionTimeUseCase(repository),
          inject: [ServiceOrdersRepositoryInterface],
        },
        {
          provide: ServiceOrdersRepositoryInterface,
          useValue: {
            findExecutionTimes: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get(GetAverageExecutionTimeUseCase);
    repository = module.get(ServiceOrdersRepositoryInterface);
  });

  describe('getAverageExecutionTime', () => {
    it('should return 0 when no orders', async () => {
      repository.findExecutionTimes.mockResolvedValue([]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(0);
    });

    it('should calculate average', async () => {
      const now = Date.now();
      repository.findExecutionTimes.mockResolvedValue([
        { startTime: new Date(now - 120000), endTime: new Date(now) },
        { startTime: new Date(now - 60000), endTime: new Date(now) },
      ]);

      const result = await useCase.getAverageExecutionTime();

      expect(result.totalOrdersAnalyzed).toBe(2);
      expect(result.averageExecutionTimeMinutes).toBeGreaterThan(0);
    });
  });
});
