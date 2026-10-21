import StartServiceController from '@service-orders/presentation/controllers/start-service.controller';
import type { StartServiceUseCase } from '@service-orders/application/usecases/service-order/start-service.use-case';

describe('StartServiceController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new StartServiceController({
      execute,
    } as unknown as StartServiceUseCase);

    // Act
    const response = await controller.handle({
      body: undefined,
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('os-1');
  });
});
