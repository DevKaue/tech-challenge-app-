import UpdateServiceOrderStatusController from '@service-orders/presentation/controllers/update-service-order-status.controller';
import type { UpdateServiceOrderStatusUseCase } from '@service-orders/application/usecases/service-order/update-service-order-status.use-case';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

describe('UpdateServiceOrderStatusController', () => {
  it('retorna 200 e delega ao use case com o ator da requisição', async () => {
    // Arrange
    const output = { id: 'os-1', status: ServiceOrderStatus.IN_DIAGNOSIS };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new UpdateServiceOrderStatusController({
      execute,
    } as unknown as UpdateServiceOrderStatusUseCase);

    // Act
    const response = await controller.handle({
      body: {
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        notes: 'Aguardando peças',
        userId: 'user-1',
        email: 'user@acme.com',
      },
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith(
      'os-1',
      { status: ServiceOrderStatus.IN_DIAGNOSIS, notes: 'Aguardando peças' },
      { id: 'user-1', email: 'user@acme.com' },
    );
  });
});
