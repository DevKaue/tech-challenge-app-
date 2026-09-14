import FinishServiceController from '@service-orders/presentation/controllers/finish-service.controller';
import type { FinishServiceUseCase } from '@service-orders/application/usecases/service-order/finish-service.use-case';

describe('FinishServiceController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new FinishServiceController({
      execute,
    } as unknown as FinishServiceUseCase);

    // Act
    const response = await controller.handle({
      body: { mechanicId: 'mec-1', notes: 'ok' },
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('os-1', 'mec-1', 'ok');
  });
});
