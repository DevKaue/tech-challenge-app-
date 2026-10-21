import CreateEstimateController from '@service-orders/presentation/controllers/create-estimate.controller';
import type { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';

describe('CreateEstimateController', () => {
  it('retorna 201 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new CreateEstimateController({
      execute,
    } as unknown as CreateEstimateUseCase);

    // Act
    const response = await controller.handle({
      body: undefined,
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('os-1');
  });
});
