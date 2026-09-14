import UpdateMechanicAvailabilityController from '@service-orders/presentation/controllers/update-mechanic-availability.controller';
import type { UpdateMechanicAvailabilityUseCase } from '@service-orders/application/usecases/mechanic/update-mechanic-availability.use-case';

describe('UpdateMechanicAvailabilityController', () => {
  it('retorna 200 sem corpo e repassa mecanico e disponibilidade', async () => {
    // Arrange
    const execute = jest.fn().mockResolvedValue(undefined);
    const controller = new UpdateMechanicAvailabilityController({
      execute,
    } as unknown as UpdateMechanicAvailabilityUseCase);

    // Act
    const response = await controller.handle({
      body: { available: false },
      params: { mechanicId: 'mec-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBeUndefined();
    expect(execute).toHaveBeenCalledWith('mec-1', false);
  });
});
