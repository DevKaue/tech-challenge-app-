import DeliverVehicleController from '@service-orders/presentation/controllers/deliver-vehicle.controller';
import type { DeliverVehicleUseCase } from '@service-orders/application/usecases/service-order/deliver-vehicle.use-case';

describe('DeliverVehicleController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new DeliverVehicleController({
      execute,
    } as unknown as DeliverVehicleUseCase);

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
