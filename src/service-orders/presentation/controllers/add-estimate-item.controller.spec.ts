import AddEstimateItemController from '@service-orders/presentation/controllers/add-estimate-item.controller';
import type { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';

describe('AddEstimateItemController', () => {
  it('retorna 201 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new AddEstimateItemController({
      execute,
    } as unknown as AddEstimateItemUseCase);

    // Act
    const response = await controller.handle({
      body: { referenceId: 'p-1', quantity: 2 },
      params: { estimateId: 'est-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('est-1', {
      referenceId: 'p-1',
      quantity: 2,
    });
  });
});
