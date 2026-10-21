import FindAllServiceOrdersController from '@service-orders/presentation/controllers/find-all-service-orders.controller';
import type { FindAllServiceOrdersUseCase } from '@service-orders/application/usecases/service-order/find-all-service-orders.use-case';
import type { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';

describe('FindAllServiceOrdersController', () => {
  it('retorna 200 aplicando o presenter de resumo, com as chaves em snake_case', async () => {
    // Arrange
    const closedAt = new Date('2026-01-02T00:00:00.000Z');
    const createdAt = new Date('2026-01-01T00:00:00.000Z');
    const dto = {
      id: 'os-1',
      status: 'RECEIVED',
      mileage: 1000,
      notes: null,
      closedAt,
      createdAt,
      updatedAt: createdAt,
      customer: { id: 'c-1', name: 'Ana' },
      vehicle: {
        id: 'v-1',
        plate: 'ABC1D23',
        brand: 'Fiat',
        model: 'Uno',
        year: 2020,
      },
      mechanic: null,
    } as unknown as ServiceOrderSummaryDto;
    const execute = jest.fn().mockResolvedValue([dto]);
    const controller = new FindAllServiceOrdersController({
      execute,
    } as unknown as FindAllServiceOrdersUseCase);

    // Act
    const response = await controller.handle();

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual([
      {
        id: 'os-1',
        status: 'RECEIVED',
        mileage: 1000,
        notes: null,
        closed_at: closedAt,
        created_at: createdAt,
        updated_at: createdAt,
        customer: { id: 'c-1', name: 'Ana' },
        vehicle: {
          id: 'v-1',
          plate: 'ABC1D23',
          brand: 'Fiat',
          model: 'Uno',
          year: 2020,
        },
        mechanic: null,
      },
    ]);
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
