import AssignMechanicController from '@service-orders/presentation/controllers/assign-mechanic.controller';
import type { AssignMechanicUseCase } from '@service-orders/application/usecases/mechanic/assign-mechanic.use-case';

describe('AssignMechanicController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new AssignMechanicController({
      execute,
    } as unknown as AssignMechanicUseCase);

    // Act
    const response = await controller.handle({
      body: { mechanicId: 'mec-1' },
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith('os-1', { mechanicId: 'mec-1' });
  });
});
