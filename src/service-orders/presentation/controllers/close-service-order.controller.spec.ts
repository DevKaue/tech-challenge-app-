import CloseServiceOrderController from '@service-orders/presentation/controllers/close-service-order.controller';
import type { CloseServiceOrderUseCase } from '@service-orders/application/usecases/service-order/close-service-order.use-case';

describe('CloseServiceOrderController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new CloseServiceOrderController({
      execute,
    } as unknown as CloseServiceOrderUseCase);

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
