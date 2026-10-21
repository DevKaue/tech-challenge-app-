import RejectEstimateController from '@service-orders/presentation/controllers/reject-estimate.controller';
import type { RejectEstimateUseCase } from '@service-orders/application/usecases/estimate/reject-estimate.use-case';

describe('RejectEstimateController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new RejectEstimateController({
      execute,
    } as unknown as RejectEstimateUseCase);

    // Act
    const response = await controller.handle({
      body: { reason: 'caro' },
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('os-1', { reason: 'caro' });
  });
});
