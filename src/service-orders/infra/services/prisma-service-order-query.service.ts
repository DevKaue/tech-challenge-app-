import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

const LISTABLE_STATUSES = [
  ServiceOrderStatus.IN_EXECUTION,
  ServiceOrderStatus.WAITING_APPROVAL,
  ServiceOrderStatus.IN_DIAGNOSIS,
  ServiceOrderStatus.RECEIVED,
];

const STATUS_PRIORITY = new Map(
  LISTABLE_STATUSES.map((status, index) => [status, index]),
);

@Injectable()
export class PrismaServiceOrderQueryService implements ServiceOrderQueryServiceInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findStatus(id: string): Promise<ServiceOrderStatusDto | null> {
    const order = await this.prisma.serviceOrder.findUnique({
      where: { id },
      select: { id: true, status: true, updatedAt: true },
    });

    return order
      ? {
          id: order.id,
          status: order.status as ServiceOrderStatus,
          updatedAt: order.updatedAt,
        }
      : null;
  }

  async findAll(): Promise<ServiceOrderSummaryDto[]> {
    const orders = await this.prisma.serviceOrder.findMany({
      where: {
        status: { in: LISTABLE_STATUSES },
      },
      include: {
        customer: { select: { id: true, name: true } },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
          },
        },
        mechanic: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    orders.sort((first, second) => {
      const statusDifference =
        (STATUS_PRIORITY.get(first.status as ServiceOrderStatus) ??
          Number.MAX_SAFE_INTEGER) -
        (STATUS_PRIORITY.get(second.status as ServiceOrderStatus) ??
          Number.MAX_SAFE_INTEGER);

      return (
        statusDifference ||
        first.createdAt.getTime() - second.createdAt.getTime()
      );
    });

    return orders.map((order) => ({
      id: order.id,
      status: order.status,
      mileage: order.mileage,
      notes: order.notes,
      closedAt: order.closedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
      },
      vehicle: {
        id: order.vehicle.id,
        plate: order.vehicle.plate,
        brand: order.vehicle.brand,
        model: order.vehicle.model,
        year: order.vehicle.year,
      },
      mechanic: order.mechanic
        ? { id: order.mechanic.id, name: order.mechanic.name }
        : null,
    }));
  }

  async findOne(id: string): Promise<ServiceOrderDetailDto | null> {
    const order = await this.prisma.serviceOrder.findUnique({
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

    if (!order) return null;

    return {
      id: order.id,
      status: order.status,
      mileage: order.mileage,
      notes: order.notes,
      closedAt: order.closedAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      customer: {
        id: order.customer.id,
        document: order.customer.document,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
      },
      vehicle: {
        id: order.vehicle.id,
        plate: order.vehicle.plate,
        brand: order.vehicle.brand,
        model: order.vehicle.model,
        year: order.vehicle.year,
        customerId: order.vehicle.customerId,
      },
      mechanic: order.mechanic
        ? {
            id: order.mechanic.id,
            name: order.mechanic.name,
            role: order.mechanic.role,
          }
        : null,
      estimates: order.estimates.map((est) => ({
        id: est.id,
        status: est.status as EstimateStatus,
        totalAmount: Number(est.totalAmount),
        validUntil: est.validUntil,
        approvedAt: est.approvedAt,
        notes: est.notes,
        createdAt: est.createdAt,
        updatedAt: est.updatedAt,
        items: est.items.map((item) => ({
          id: item.id,
          itemType: item.itemType,
          referenceId: item.referenceId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          notes: item.notes,
        })),
      })),
      statusHistory: order.statusHistory.map((h) => ({
        id: h.id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        changedBy: h.changedBy,
        notes: h.notes,
        changedAt: h.changedAt,
      })),
    };
  }
}
