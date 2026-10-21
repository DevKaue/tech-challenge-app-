import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { PrismaServiceOrderQueryService } from './prisma-service-order-query.service';

describe('PrismaServiceOrderQueryService', () => {
  const createOrder = (
    id: string,
    status: ServiceOrderStatus,
    createdAt: string,
  ) => ({
    id,
    status,
    mileage: null,
    notes: null,
    closedAt: null,
    createdAt: new Date(createdAt),
    updatedAt: new Date(createdAt),
    customer: { id: 'customer-1', name: 'Customer' },
    vehicle: {
      id: 'vehicle-1',
      plate: 'ABC1D23',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2022,
    },
    mechanic: null,
  });

  it('should filter inactive orders and sort by status priority and age', async () => {
    const findMany = jest
      .fn()
      .mockResolvedValue([
        createOrder(
          'received-newer',
          ServiceOrderStatus.RECEIVED,
          '2026-01-04T00:00:00.000Z',
        ),
        createOrder(
          'diagnosis',
          ServiceOrderStatus.IN_DIAGNOSIS,
          '2026-01-03T00:00:00.000Z',
        ),
        createOrder(
          'execution',
          ServiceOrderStatus.IN_EXECUTION,
          '2026-01-05T00:00:00.000Z',
        ),
        createOrder(
          'received-older',
          ServiceOrderStatus.RECEIVED,
          '2026-01-01T00:00:00.000Z',
        ),
        createOrder(
          'approval',
          ServiceOrderStatus.WAITING_APPROVAL,
          '2026-01-02T00:00:00.000Z',
        ),
      ]);
    const prisma = {
      serviceOrder: { findMany },
    } as unknown as PrismaService;
    const queryService = new PrismaServiceOrderQueryService(prisma);

    const result = await queryService.findAll();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: {
            in: [
              ServiceOrderStatus.IN_EXECUTION,
              ServiceOrderStatus.WAITING_APPROVAL,
              ServiceOrderStatus.IN_DIAGNOSIS,
              ServiceOrderStatus.RECEIVED,
            ],
          },
        },
        orderBy: { createdAt: 'asc' },
      }),
    );
    expect(result.map((order) => order.id)).toEqual([
      'execution',
      'approval',
      'diagnosis',
      'received-older',
      'received-newer',
    ]);
  });

  it('should select only the fields required by the status endpoint', async () => {
    const updatedAt = new Date('2026-08-17T12:00:00.000Z');
    const findUnique = jest.fn().mockResolvedValue({
      id: 'order-1',
      status: ServiceOrderStatus.WAITING_APPROVAL,
      updatedAt,
    });
    const prisma = {
      serviceOrder: { findUnique },
    } as unknown as PrismaService;
    const queryService = new PrismaServiceOrderQueryService(prisma);

    const result = await queryService.findStatus('order-1');

    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'order-1' },
      select: { id: true, status: true, updatedAt: true },
    });
    expect(result).toEqual({
      id: 'order-1',
      status: ServiceOrderStatus.WAITING_APPROVAL,
      updatedAt,
    });
  });
});
