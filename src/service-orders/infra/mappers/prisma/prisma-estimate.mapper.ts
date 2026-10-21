import type { Estimate as PrismaEstimate } from '@prisma/client';
import { PersistedEstimate } from '@service-orders/domain/persistence/estimate.persistence';

export class PrismaEstimateMapper {
  static toPersistence(entity: PrismaEstimate): PersistedEstimate {
    return {
      id: entity.id,
      serviceOrderId: entity.serviceOrderId,
      status: entity.status,
      totalAmount: Number(entity.totalAmount),
      validUntil: entity.validUntil,
      approvedAt: entity.approvedAt,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
