import type { EstimateItem as PrismaEstimateItem } from '@prisma/client';
import { PersistedEstimateItem } from '@service-orders/domain/persistence/estimate-item.persistence';

export class PrismaEstimateItemMapper {
  static toPersistence(entity: PrismaEstimateItem): PersistedEstimateItem {
    return {
      id: entity.id,
      estimateId: entity.estimateId,
      itemType: entity.itemType,
      referenceId: entity.referenceId,
      description: entity.description,
      quantity: Number(entity.quantity),
      unitPrice: Number(entity.unitPrice),
      totalPrice: Number(entity.totalPrice),
      notes: entity.notes,
    };
  }
}
