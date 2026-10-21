import StartDiagnosisController from '@service-orders/presentation/controllers/start-diagnosis.controller';
import type { StartDiagnosisUseCase } from '@service-orders/application/usecases/diagnosis/startDiagnosis.use-case';

describe('StartDiagnosisController', () => {
  it('retorna 200 e delega ao use case', async () => {
    // Arrange
    const output = { id: 'os-1' };
    const startDiagnosis = jest.fn().mockResolvedValue(output);
    const controller = new StartDiagnosisController({
      startDiagnosis,
    } as unknown as StartDiagnosisUseCase);

    // Act
    const response = await controller.handle({
      body: { mechanicId: 'mec-1' },
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(startDiagnosis).toHaveBeenCalledWith('os-1', {
      mechanicId: 'mec-1',
    });
  });
});
