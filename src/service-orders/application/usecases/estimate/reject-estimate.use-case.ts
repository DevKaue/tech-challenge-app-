import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import type { PartRepository } from '@service-orders/domain/acls/part-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { ServiceOrderItemType } from '@service-orders/domain/enums/service-order-item-type.enum';

export class RejectEstimateUseCase {
  constructor(
    private readonly repository: ServiceOrdersRepositoryInterface,
    private readonly partRepository: PartRepository,
  ) {}

  async execute(id: string, dto: RejectEstimateDto) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.rejectEstimate();

      const updated = await this.repository.update(id, order);

      const pendingItems = data.estimates
        .filter(
          (estimate) =>
            (estimate.status as EstimateStatus) === EstimateStatus.PENDING,
        )
        .flatMap((estimate) => estimate.items)
        .filter(
          (item) =>
            (item.itemType as ServiceOrderItemType) ===
            ServiceOrderItemType.PART,
        );

      const pendingEstimates = data.estimates.filter(
        (estimate) =>
          (estimate.status as EstimateStatus) === EstimateStatus.PENDING,
      );

      for (const estimate of pendingEstimates) {
        await this.repository.updateEstimateStatus(
          estimate.id,
          EstimateStatus.REJECTED,
        );
      }

      for (const item of pendingItems) {
        await this.partRepository.incrementStock(
          item.referenceId,
          Number(item.quantity),
        );
      }

      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        notes: dto.reason,
      });

      return plainToInstance(ServiceOrderResponseDto, updated, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }
}
