import {
  EstimateWithItems,
  ServiceOrdersRepositoryInterface,
} from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';
import type { PartRepository } from '@service-orders/domain/acls/part-repository.interface';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { StatusChange } from '@service-orders/domain/value-objects/status-change.value-object';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';
import { PersistedEstimate } from '@service-orders/domain/persistence/estimate.persistence';

type EstimateStatusUpdate = UpdateEstimateStatusDto & {
  reason?: string;
};

export class UpdateEstimateStatusUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    private readonly partRepository: PartRepository,
  ) {}

  async execute(
    estimateId: string,
    dto: EstimateStatusUpdate,
    changedBy = 'system',
  ) {
    const estimate = await this.repository.findEstimateById(estimateId);
    if (!estimate) throw new EstimateNotFoundException(estimateId);

    const existingStatus = estimate.status as EstimateStatus;

    // Idempotência: notificações/atualizações repetidas não alteram o estado.
    if (existingStatus === dto.status) {
      return this.toResponse(estimate);
    }

    // Um orçamento aprovado já moveu a OS para IN_EXECUTION; não pode ser
    // reaberto por uma notificação conflitante (ex.: REJECTED que chegou atrasada).
    if (existingStatus === EstimateStatus.APPROVED) {
      throw new InvalidStatusTransitionException(
        `Cannot change estimate ${estimateId} from ${estimate.status} to ${dto.status}`,
      );
    }

    if (
      dto.status !== EstimateStatus.APPROVED &&
      dto.status !== EstimateStatus.REJECTED
    ) {
      const updated = await this.repository.updateEstimateStatus(
        estimateId,
        dto.status,
      );
      return this.toResponse(updated);
    }

    const data = await this.repository.findById(estimate.serviceOrderId);
    if (!data) {
      throw new ServiceOrderNotFoundException(estimate.serviceOrderId);
    }

    const order = ServiceOrderMapper.toDomain(data);
    const change = this.transitionOrder(order, dto.status);
    const updatedEstimate = await this.repository.updateEstimateStatus(
      estimateId,
      dto.status,
      dto.status === EstimateStatus.APPROVED ? new Date() : undefined,
    );

    await this.repository.update(order.id, order);

    if (dto.status === EstimateStatus.REJECTED) {
      await this.restoreParts(estimate);
    }

    await this.repository.createStatusHistory({
      serviceOrderId: order.id,
      previousStatus: change.previousStatus,
      newStatus: change.newStatus,
      changedBy,
      ...(dto.reason ? { notes: dto.reason } : {}),
    });

    return this.toResponse(updatedEstimate);
  }

  private transitionOrder(
    order: ServiceOrder,
    status: EstimateStatus,
  ): StatusChange {
    try {
      return status === EstimateStatus.APPROVED
        ? order.startService()
        : order.rejectEstimate();
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }

  private async restoreParts(estimate: EstimateWithItems): Promise<void> {
    const partItems = estimate.items.filter(
      (item) =>
        (item.itemType as ServiceOrderItemType) === ServiceOrderItemType.PART,
    );

    for (const item of partItems) {
      await this.partRepository.incrementStock(
        item.referenceId,
        Number(item.quantity),
      );
    }
  }

  private toResponse(estimate: PersistedEstimate): EstimateResponseDto {
    return plainToInstance(EstimateResponseDto, estimate, {
      excludeExtraneousValues: true,
    });
  }
}
