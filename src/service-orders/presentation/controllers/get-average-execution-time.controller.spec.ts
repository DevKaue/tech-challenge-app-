import GetAverageExecutionTimeController from '@service-orders/presentation/controllers/get-average-execution-time.controller';
import type { GetAverageExecutionTimeUseCase } from '@service-orders/application/usecases/metrics/get-avetage-execution-time.use-case';

describe('GetAverageExecutionTimeController', () => {
  it('retorna 200 com a metrica do use case', async () => {
    // Arrange
    const output = { averageExecutionTimeInMinutes: 42 };
    const getAverageExecutionTime = jest.fn().mockResolvedValue(output);
    const controller = new GetAverageExecutionTimeController({
      getAverageExecutionTime,
    } as unknown as GetAverageExecutionTimeUseCase);

    // Act
    const response = await controller.handle();

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(getAverageExecutionTime).toHaveBeenCalledTimes(1);
  });
});
