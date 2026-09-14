import GetServiceOrderStatusController from '@service-orders/presentation/controllers/get-service-order-status.controller';
import type { GetServiceOrderStatusUseCase } from '@service-orders/application/usecases/service-order/get-service-order-status.use-case';
import type { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

describe('GetServiceOrderStatusController', () => {
  it('retorna 200 com o status da OS', async () => {
    // Arrange
    const updatedAt = new Date('2026-01-01T00:00:00.000Z');
    const dto: ServiceOrderStatusDto = {
      id: 'os-1',
      status: ServiceOrderStatus.IN_DIAGNOSIS,
      updatedAt,
    };
    const execute = jest.fn().mockResolvedValue(dto);
    const controller = new GetServiceOrderStatusController({
      execute,
    } as unknown as GetServiceOrderStatusUseCase);

    // Act
    const response = await controller.handle({
      body: undefined,
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(dto);
    expect(execute).toHaveBeenCalledWith('os-1');
  });
});
