import { ServiceOrderDetailDto } from '@service-orders/application/dto/query/service-order-detail.dto';

export const SERVICE_ORDERS_INTERFACE = Symbol('SERVICE_ORDERS_INTERFACE');

export interface ServiceOrdersPublicInterface {
  findServiceOrderById(id: string): Promise<ServiceOrderDetailDto | null>;
}
