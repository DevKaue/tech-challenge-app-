import { PersistedServiceOrder } from '@service-orders/domain/persistence/service-order.persistence';
import { ServiceOrderWithRelations } from '@service-orders/domain/contracts/service-orders-repository.interface';

export class PrismaServiceOrderMapper {
  static toPersistence(entity: {
    id: string;
    customerId: string;
    vehicleId: string;
    mechanicId: string | null;
    status: string;
    mileage: number | null;
    notes: string | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    mechanic?: { id: string; name: string } | null;
  }): PersistedServiceOrder {
    return {
      id: entity.id,
      customerId: entity.customerId,
      vehicleId: entity.vehicleId,
      mechanicId: entity.mechanicId,
      status: entity.status,
      mileage: entity.mileage,
      notes: entity.notes,
      mechanic: entity.mechanic ?? null,
      closedAt: entity.closedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPersistenceWithRelations(entity: {
    id: string;
    customerId: string;
    vehicleId: string;
    mechanicId: string | null;
    status: string;
    mileage: number | null;
    notes: string | null;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    customer: {
      id: string;
      document: string;
      email: string | null;
      phone: string | null;
      name: string;
      createdAt: Date;
      updatedAt: Date;
    };
    vehicle: {
      id: string;
      plate: string;
      brand: string;
      model: string;
      year: number;
      customerId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    mechanic: {
      id: string;
      name: string;
      role: string;
    } | null;
    estimates: Array<{
      id: string;
      serviceOrderId: string;
      status: string;
      totalAmount: { toNumber(): number };
      validUntil: Date | null;
      approvedAt: Date | null;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
      items: Array<{
        id: string;
        estimateId: string;
        itemType: string;
        referenceId: string;
        description: string;
        quantity: { toNumber(): number };
        unitPrice: { toNumber(): number };
        totalPrice: { toNumber(): number };
        notes: string | null;
      }>;
    }>;
    statusHistory: Array<{
      id: string;
      serviceOrderId: string;
      previousStatus: string | null;
      newStatus: string;
      changedBy: string | null;
      notes: string | null;
      changedAt: Date;
    }>;
  }): ServiceOrderWithRelations {
    return {
      id: entity.id,
      customerId: entity.customerId,
      vehicleId: entity.vehicleId,
      mechanicId: entity.mechanicId,
      status: entity.status,
      mileage: entity.mileage,
      notes: entity.notes,
      mechanic: entity.mechanic
        ? {
            id: entity.mechanic.id,
            name: entity.mechanic.name,
            role: entity.mechanic.role,
          }
        : null,
      closedAt: entity.closedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      customer: {
        id: entity.customer.id,
        document: entity.customer.document,
        name: entity.customer.name,
        email: entity.customer.email,
        phone: entity.customer.phone,
        createdAt: entity.customer.createdAt,
        updatedAt: entity.customer.updatedAt,
      },
      vehicle: {
        id: entity.vehicle.id,
        plate: entity.vehicle.plate,
        brand: entity.vehicle.brand,
        model: entity.vehicle.model,
        year: entity.vehicle.year,
        customerId: entity.vehicle.customerId,
        createdAt: entity.vehicle.createdAt,
        updatedAt: entity.vehicle.updatedAt,
      },
      estimates: entity.estimates.map((estimate) => ({
        id: estimate.id,
        serviceOrderId: estimate.serviceOrderId,
        status: estimate.status,
        totalAmount: Number(estimate.totalAmount),
        validUntil: estimate.validUntil,
        approvedAt: estimate.approvedAt,
        notes: estimate.notes,
        createdAt: estimate.createdAt,
        updatedAt: estimate.updatedAt,
        items: estimate.items.map((item) => ({
          id: item.id,
          estimateId: item.estimateId,
          itemType: item.itemType,
          referenceId: item.referenceId,
          description: item.description,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          notes: item.notes,
        })),
      })),
      statusHistory: entity.statusHistory.map((history) => ({
        id: history.id,
        serviceOrderId: history.serviceOrderId,
        previousStatus: history.previousStatus,
        newStatus: history.newStatus,
        changedBy: history.changedBy,
        notes: history.notes,
        changedAt: history.changedAt,
      })),
    };
  }
}
