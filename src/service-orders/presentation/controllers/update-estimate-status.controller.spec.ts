import UpdateEstimateStatusController from '@service-orders/presentation/controllers/update-estimate-status.controller';
import type { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';

describe('UpdateEstimateStatusController', () => {
  it.each([undefined, 'c-1'])(
    'retorna 200 e delega ao use case (customerId: %s)',
    async (customerId) => {
      // Arrange
      const output = { id: 'os-1' };
      const execute = jest.fn().mockResolvedValue(output);
      const controller = new UpdateEstimateStatusController({
        execute,
      } as unknown as UpdateEstimateStatusUseCase);

      // Act
      const response = await controller.handle({
        body: { status: 'APPROVED' },
        params: { estimateId: 'est-1', customerId },
        query: undefined,
      });

      // Assert
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(output);
      expect(execute).toHaveBeenCalledWith(
        'est-1',
        { status: 'APPROVED' },
        undefined,
        customerId,
      );
    },
  );
});
