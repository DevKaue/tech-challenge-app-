import { Injectable } from '@nestjs/common';
import PrismaUnitOfWorkService from '@/common/infra/services/prisma-unit-of-work.service';
import {
  ServiceOrdersRepositoryInterface,
  ServiceOrderWithRelations,
  PersistedServiceOrder,
  PersistedEstimate,
  PersistedEstimateItem,
  PersistedStatusHistory,
  EstimateWithItems,
} from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
import { PrismaServiceOrderMapper } from '@service-orders/infra/mappers/prisma/prisma-service-order.mapper';
import { PrismaEstimateMapper } from '@service-orders/infra/mappers/prisma/prisma-estimate.mapper';
import { PrismaEstimateItemMapper } from '@service-orders/infra/mappers/prisma/prisma-estimate-item.mapper';

@Injectable()
export class PrismaServiceOrdersRepository extends ServiceOrdersRepositoryInterface {
  constructor(private readonly uow: PrismaUnitOfWorkService) {
    super();
  }

  async create(data: {
    customerId: string;
    vehicleId: string;
    status: ServiceOrderStatus;
    mileage?: number | null;
    notes?: string | null;
  }): Promise<PersistedServiceOrder> {
    const serviceOrder = await this.uow.client.serviceOrder.create({ data });

    return PrismaServiceOrderMapper.toPersistence(serviceOrder);
  }

  async findAll(): Promise<PersistedServiceOrder[]> {
    const serviceOrders = await this.uow.client.serviceOrder.findMany({
      include: { customer: true, vehicle: true },
    });

    return serviceOrders.map((serviceOrder) =>
      PrismaServiceOrderMapper.toPersistence(serviceOrder),
    );
  }

  async findById(id: string): Promise<ServiceOrderWithRelations | null> {
    const result = await this.uow.client.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        mechanic: { select: { id: true, name: true, role: true } },
        estimates: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
    return result
      ? PrismaServiceOrderMapper.toPersistenceWithRelations(result)
      : null;
  }

  async findEstimateById(id: string): Promise<EstimateWithItems | null> {
    const estimate = await this.uow.client.estimate.findUnique({
      where: { id },
      include: { items: true },
    });

    return estimate
      ? {
          ...PrismaEstimateMapper.toPersistence(estimate),
          items: estimate.items.map((item) =>
            PrismaEstimateItemMapper.toPersistence(item),
          ),
        }
      : null;
  }

  async update(
    id: string,
    order: ServiceOrder,
  ): Promise<PersistedServiceOrder> {
    const serviceOrder = await this.uow.client.serviceOrder.update({
      where: { id },
      data: order.toUpdateData(),
      include: { mechanic: { select: { id: true, name: true } } },
    });

    return PrismaServiceOrderMapper.toPersistence(serviceOrder);
  }

  async createStatusHistory(data: {
    serviceOrderId: string;
    previousStatus: ServiceOrderStatus | null;
    newStatus: ServiceOrderStatus;
    changedBy?: string;
    notes?: string;
  }): Promise<PersistedStatusHistory> {
    return this.uow.client.serviceOrderStatusHistory.create({ data });
  }

  async createEstimate(data: {
    serviceOrderId: string;
    status: EstimateStatus;
    totalAmount: number;
  }): Promise<PersistedEstimate> {
    const estimate = await this.uow.client.estimate.create({ data });

    return PrismaEstimateMapper.toPersistence(estimate);
  }

  async addEstimateItem(data: {
    estimateId: string;
    itemType: ServiceOrderItemType;
    referenceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }): Promise<PersistedEstimateItem> {
    const estimate = await this.uow.client.estimateItem.create({ data });

    return PrismaEstimateItemMapper.toPersistence(estimate);
  }

  async updateEstimateStatus(
    id: string,
    status: EstimateStatus,
    approvedAt?: Date,
  ): Promise<PersistedEstimate> {
    const estimate = await this.uow.client.estimate.update({
      where: { id },
      data: { status, ...(approvedAt ? { approvedAt } : {}) },
    });

    return PrismaEstimateMapper.toPersistence(estimate);
  }

  async recalcEstimateTotal(estimateId: string): Promise<PersistedEstimate> {
    const aggregate = await this.uow.client.estimateItem.aggregate({
      where: { estimateId },
      _sum: { totalPrice: true },
    });

    const estimate = await this.uow.client.estimate.update({
      where: { id: estimateId },
      data: { totalAmount: aggregate._sum.totalPrice ?? 0 },
    });

    return PrismaEstimateMapper.toPersistence(estimate);
  }

  async findExecutionTimes() {
    const history = await this.uow.client.serviceOrderStatusHistory.findMany({
      where: {
        newStatus: {
          in: [ServiceOrderStatus.IN_EXECUTION, ServiceOrderStatus.FINISHED],
        },
      },
      select: {
        serviceOrderId: true,
        newStatus: true,
        changedAt: true,
      },
      orderBy: { changedAt: 'asc' },
    });

    const orderTimes = new Map<string, { startTime?: Date; endTime?: Date }>();

    for (const entry of history) {
      const serviceOrderStatus = entry.newStatus as ServiceOrderStatus;
      const current = orderTimes.get(entry.serviceOrderId) || {};
      if (serviceOrderStatus === ServiceOrderStatus.IN_EXECUTION) {
        current.startTime = entry.changedAt;
      } else if (serviceOrderStatus === ServiceOrderStatus.FINISHED) {
        current.endTime = entry.changedAt;
      }
      orderTimes.set(entry.serviceOrderId, current);
    }

    return Array.from(orderTimes.values()).filter(
      (t): t is { startTime: Date; endTime: Date } =>
        t.startTime != null && t.endTime != null,
    );
  }
}
