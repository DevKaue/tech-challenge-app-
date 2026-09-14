import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

export class CreateEstimateUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async execute(orderId: string) {
    const data = await this.repository.findById(orderId);
    if (!data) throw new ServiceOrderNotFoundException(orderId);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.requestApproval();

      const [estimate] = await Promise.all([
        this.repository.createEstimate({
          serviceOrderId: orderId,
          status: EstimateStatus.PENDING,
          totalAmount: 0,
        }),
        this.repository.update(orderId, order),
      ]);

      await this.repository.createStatusHistory({
        serviceOrderId: orderId,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
        changedBy: 'system',
        notes: 'Estimate generated',
      });

      return plainToInstance(EstimateResponseDto, estimate, {
        excludeExtraneousValues: true,
      });
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }
}
