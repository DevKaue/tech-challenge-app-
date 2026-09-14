import { ServiceOrder } from '@service-orders/domain/entities/service-order.entity';
import { ServiceOrderUpdateData } from '@service-orders/domain/contracts/service-orders-repository.interface';

export class ServiceOrderPersistenceMapper {
  static toPersistence(serviceOrder: ServiceOrder): ServiceOrderUpdateData {
    return {
      status: serviceOrder.status,
      mechanicId: serviceOrder.mechanicId,
    };
  }
}
