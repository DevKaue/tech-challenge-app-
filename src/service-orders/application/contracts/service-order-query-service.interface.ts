import { ServiceOrderSummaryDto } from '@service-orders/application/dto/query/service-order-summary.dto';
import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';

export abstract class ServiceOrderQueryServiceInterface {
  abstract findAll(): Promise<ServiceOrderSummaryDto[]>;

  /**
   * Com `customerId`, só devolve a OS desse cliente: a de outro é `null` e vira
   * 404, e não 403, para não revelar que ela existe.
   */
  abstract findOne(
    id: string,
    customerId?: string,
  ): Promise<ServiceOrderDetailDto | null>;

  /** Mesmo escopo por `customerId` do `findOne`. */
  abstract findStatus(
    id: string,
    customerId?: string,
  ): Promise<ServiceOrderStatusDto | null>;
}
