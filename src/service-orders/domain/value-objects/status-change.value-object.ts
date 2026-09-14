import { ServiceOrderStatus } from '@service-orders/domain/enums/service-order-status.enum';

export class StatusChange {
  constructor(
    readonly previousStatus: ServiceOrderStatus,
    readonly newStatus: ServiceOrderStatus,
  ) {}
}
