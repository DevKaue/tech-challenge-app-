import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';

export abstract class ServiceOrderQueryServiceInterface {
  abstract findAll(): Promise<ServiceOrderSummaryDto[]>;

  abstract findOne(id: string): Promise<ServiceOrderDetailDto | null>;

  abstract findStatus(id: string): Promise<ServiceOrderStatusDto | null>;
}
