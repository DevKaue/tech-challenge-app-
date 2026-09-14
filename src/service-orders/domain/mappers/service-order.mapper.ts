import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';
import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { MechanicAssignment } from '@service-orders/domain/value-objects/mechanic-assignment.value-object';
import { PersistedServiceOrder } from '@service-orders/domain/persistence/service-order.persistence';

export class ServiceOrderMapper {
  static toDomain(data: PersistedServiceOrder): ServiceOrder {
    return ServiceOrder.create({
      id: data.id,
      status: data.status as ServiceOrderStatus,
      mechanic: data.mechanic
        ? MechanicAssignment.fromPersistence(
            data.mechanic.id,
            data.mechanic.name,
          )
        : data.mechanicId
          ? MechanicAssignment.fromPersistence(data.mechanicId, '')
          : null,
    });
  }
}
