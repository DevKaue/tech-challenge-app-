import FindOneServiceOrderController from '@service-orders/presentation/controllers/find-one-service-order.controller';
import type { FindOneServiceOrderUseCase } from '@service-orders/application/usecases/service-order/find-one-service-order.use-case';
import type { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

describe('FindOneServiceOrderController', () => {
  it('retorna 200 aplicando o presenter de detalhe', async () => {
    // Arrange
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const dto = {
      id: 'os-1',
      status: 'RECEIVED',
      mileage: null,
      notes: null,
      closedAt: null,
      createdAt,
      updatedAt: createdAt,
      customer: { id: 'c-1', name: 'Ana' },
      vehicle: { id: 'v-1', plate: 'ABC1D23', customerId: 'c-1' },
      mechanic: null,
      estimates: [],
      statusHistory: [],
    } as unknown as ServiceOrderDetailDto;
    const execute = jest.fn().mockResolvedValue(dto);
    const controller = new FindOneServiceOrderController({
      execute,
    } as unknown as FindOneServiceOrderUseCase);

    // Act
    const response = await controller.handle({
      body: undefined,
      params: { id: 'os-1' },
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: 'os-1',
        created_at: createdAt,
        // o presenter acrescenta customer_id ao veiculo
        vehicle: {
          id: 'v-1',
          plate: 'ABC1D23',
          customerId: 'c-1',
          customer_id: 'c-1',
        },
      }),
    );
    expect(execute).toHaveBeenCalledWith('os-1');
  });
});
