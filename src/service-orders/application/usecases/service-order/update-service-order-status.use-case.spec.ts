import { UpdateServiceOrderStatusUseCase } from './update-service-order-status.use-case';
import {
  ServiceOrdersRepositoryInterface,
  ServiceOrderWithRelations,
} from '@service-orders/domain/contracts/service-orders-repository.interface';
import { PersistedServiceOrder } from '@service-orders/domain/persistence/service-order.persistence';
import { PersistedStatusHistory } from '@service-orders/domain/persistence/status-history.persistence';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

describe('UpdateServiceOrderStatusUseCase', () => {
  let useCase: UpdateServiceOrderStatusUseCase;
  let findById: jest.MockedFunction<
    ServiceOrdersRepositoryInterface['findById']
  >;
  let update: jest.MockedFunction<ServiceOrdersRepositoryInterface['update']>;
  let createStatusHistory: jest.MockedFunction<
    ServiceOrdersRepositoryInterface['createStatusHistory']
  >;

  const actor = {
    id: 'attendant-1',
    email: 'attendant@oficina.com',
  };

  const createOrder = (
    status: ServiceOrderStatus,
  ): ServiceOrderWithRelations => {
    const timestamp = new Date('2026-01-01T00:00:00.000Z');

    return {
      id: 'order-1',
      customerId: 'customer-1',
      vehicleId: 'vehicle-1',
      status,
      mileage: null,
      notes: null,
      mechanicId: null,
      mechanic: null,
      closedAt: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      customer: {
        id: 'customer-1',
        document: '52998224725',
        email: 'customer@email.com',
        phone: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      vehicle: {
        id: 'vehicle-1',
        plate: 'ABC1D23',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2022,
        customerId: 'customer-1',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
      estimates: [],
      statusHistory: [],
    };
  };

  beforeEach(() => {
    findById = jest.fn();
    update = jest.fn();
    createStatusHistory = jest.fn();

    const repository = {
      findById,
      update,
      createStatusHistory,
    } as unknown as ServiceOrdersRepositoryInterface;
    useCase = new UpdateServiceOrderStatusUseCase(repository);
  });

  it('should update status and register the authenticated user email', async () => {
    const receivedOrder = createOrder(ServiceOrderStatus.RECEIVED);
    const updatedOrder: PersistedServiceOrder = {
      ...receivedOrder,
      status: ServiceOrderStatus.IN_DIAGNOSIS,
    };
    const history: PersistedStatusHistory = {
      id: 'history-1',
      serviceOrderId: receivedOrder.id,
      previousStatus: ServiceOrderStatus.RECEIVED,
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      changedBy: actor.email,
      notes: 'Diagnóstico iniciado por solicitação recebida por e-mail',
      changedAt: new Date('2026-01-01T00:01:00.000Z'),
    };
    findById.mockResolvedValue(receivedOrder);
    update.mockResolvedValue(updatedOrder);
    createStatusHistory.mockResolvedValue(history);

    const result = await useCase.execute(
      'order-1',
      {
        status: ServiceOrderStatus.IN_DIAGNOSIS,
        notes: 'Diagnóstico iniciado por solicitação recebida por e-mail',
      },
      actor,
    );

    expect(update).toHaveBeenCalledWith(
      'order-1',
      expect.objectContaining({ status: ServiceOrderStatus.IN_DIAGNOSIS }),
    );
    expect(createStatusHistory).toHaveBeenCalledWith({
      serviceOrderId: 'order-1',
      previousStatus: ServiceOrderStatus.RECEIVED,
      newStatus: ServiceOrderStatus.IN_DIAGNOSIS,
      changedBy: actor.email,
      notes: 'Diagnóstico iniciado por solicitação recebida por e-mail',
    });
    expect(result.status).toBe(ServiceOrderStatus.IN_DIAGNOSIS);
  });

  it('should return an invalid transition error for a forbidden status change', async () => {
    findById.mockResolvedValue(createOrder(ServiceOrderStatus.RECEIVED));

    await expect(
      useCase.execute(
        'order-1',
        { status: ServiceOrderStatus.FINISHED },
        actor,
      ),
    ).rejects.toThrow(InvalidStatusTransitionException);

    expect(update).not.toHaveBeenCalled();
    expect(createStatusHistory).not.toHaveBeenCalled();
  });

  it('should throw when the service order does not exist', async () => {
    findById.mockResolvedValue(null);

    await expect(
      useCase.execute(
        'missing-order',
        { status: ServiceOrderStatus.IN_DIAGNOSIS },
        actor,
      ),
    ).rejects.toThrow(ServiceOrderNotFoundException);
  });
});
