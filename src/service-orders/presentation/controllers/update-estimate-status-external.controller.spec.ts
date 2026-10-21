import UpdateEstimateStatusExternalController from '@service-orders/presentation/controllers/update-estimate-status-external.controller';
import type { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';
import type { RejectEstimateUseCase } from '@service-orders/application/usecases/estimate/reject-estimate.use-case';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';

describe('UpdateEstimateStatusExternalController', () => {
  function setup() {
    const updateEstimateStatusUseCase = {
      execute: jest.fn(),
    } as unknown as UpdateEstimateStatusUseCase;
    const rejectEstimateUseCase = {
      execute: jest.fn(),
    } as unknown as RejectEstimateUseCase;
    const repository = {
      findEstimateById: jest.fn(),
    };

    const controller = new UpdateEstimateStatusExternalController(
      updateEstimateStatusUseCase,
      rejectEstimateUseCase,
      repository as never,
    );

    return {
      controller,
      updateEstimateStatusUseCase,
      rejectEstimateUseCase,
      repository,
    };
  }

  it('retorna 200 e delega APPROVED ao update use case', async () => {
    const { controller, updateEstimateStatusUseCase } = setup();
    const output = { id: 'est-1' };
    (updateEstimateStatusUseCase.execute as jest.Mock).mockResolvedValue(
      output,
    );

    const response = await controller.handle({
      body: { decision: EstimateStatus.APPROVED },
      params: { estimateId: 'est-1' },
      query: undefined,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(updateEstimateStatusUseCase.execute).toHaveBeenCalledWith('est-1', {
      status: 'APPROVED',
    });
  });

  it('rota REJECTED para o RejectEstimateUseCase com o serviceOrderId do estimate', async () => {
    const { controller, rejectEstimateUseCase, repository } = setup();
    const output = { id: 'order-1', status: 'IN_DIAGNOSIS' };
    repository.findEstimateById.mockResolvedValue({
      id: 'est-1',
      serviceOrderId: 'order-1',
    });
    (rejectEstimateUseCase.execute as jest.Mock).mockResolvedValue(output);

    const response = await controller.handle({
      body: { decision: EstimateStatus.REJECTED },
      params: { estimateId: 'est-1' },
      query: undefined,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(output);
    expect(repository.findEstimateById).toHaveBeenCalledWith('est-1');
    expect(rejectEstimateUseCase.execute).toHaveBeenCalledWith('order-1', {
      reason: 'Recusado via notificação externa',
    });
  });

  it('lança EstimateNotFoundException quando o estimate não existe no caminho REJECTED', async () => {
    const { controller, repository } = setup();
    repository.findEstimateById.mockResolvedValue(null);

    await expect(
      controller.handle({
        body: { decision: EstimateStatus.REJECTED },
        params: { estimateId: 'missing' },
        query: undefined,
      }),
    ).rejects.toThrow(EstimateNotFoundException);
  });
});
