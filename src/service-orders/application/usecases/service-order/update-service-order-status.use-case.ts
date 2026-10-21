import { plainToInstance } from 'class-transformer';
import { UpdateServiceOrderStatusDto } from '@service-orders/application/dto/service-order/update-service-order-status.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { InvalidStatusTransitionException } from '@service-orders/application/exceptions/invalid-status-transition.exception';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderMapper } from '@service-orders/domain/mappers/service-order.mapper';
import { StatusChange } from '@service-orders/domain/value-objects/status-change.value-object';

type StatusUpdateActor = {
  id: string;
  email: string;
};

export class UpdateServiceOrderStatusUseCase {
  constructor(private readonly repository: ServiceOrdersRepositoryInterface) {}

  async execute(
    id: string,
    dto: UpdateServiceOrderStatusDto,
    actor: StatusUpdateActor,
  ) {
    const data = await this.repository.findById(id);
    if (!data) throw new ServiceOrderNotFoundException(id);

    const order = ServiceOrderMapper.toDomain(data);
    const change = this.updateStatus(order, dto, actor.id);
    const updated = await this.repository.update(id, order);

    await this.repository.createStatusHistory({
      serviceOrderId: id,
      previousStatus: change.previousStatus,
      newStatus: change.newStatus,
      changedBy: actor.email,
      ...(dto.notes ? { notes: dto.notes } : {}),
    });

    return plainToInstance(ServiceOrderResponseDto, updated, {
      excludeExtraneousValues: true,
    });
  }

  private updateStatus(
    order: ServiceOrder,
    dto: UpdateServiceOrderStatusDto,
    actorId: string,
  ): StatusChange {
    try {
      return order.updateStatus(dto.status, actorId);
    } catch (error: unknown) {
      throw new InvalidStatusTransitionException(
        error instanceof Error ? error.message : 'Unexpected error',
      );
    }
  }
}
