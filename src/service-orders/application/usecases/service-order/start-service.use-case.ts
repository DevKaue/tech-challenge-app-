import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { plainToInstance } from 'class-transformer';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';

export class StartServiceUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async execute(id: string) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const order = ServiceOrderMapper.toDomain(data);
    try {
      const change = order.startService();
      const updated = await this.repository.update(id, order);

      await this.repository.createStatusHistory({
        serviceOrderId: id,
        previousStatus: change.previousStatus,
        newStatus: change.newStatus,
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
