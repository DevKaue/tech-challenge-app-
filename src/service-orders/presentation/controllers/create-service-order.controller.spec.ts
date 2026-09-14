import CreateServiceOrderController from '@service-orders/presentation/controllers/create-service-order.controller';
import type { CreateServiceOrderUseCase } from '@service-orders/application/usecases/service-order/create-service-order.use-case';

describe('CreateServiceOrderController', () => {
  it('retorna 201 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new CreateServiceOrderController({
      execute,
    } as unknown as CreateServiceOrderUseCase);

    // Act
    const response = await controller.handle({
      body: {
        customerId: 'c-1',
        vehicleId: 'v-1',
        services: [{ referenceId: 's-1', quantity: 1 }],
      },
      params: undefined,
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith({
      customerId: 'c-1',
      vehicleId: 'v-1',
      services: [{ referenceId: 's-1', quantity: 1 }],
    });
  });
});
