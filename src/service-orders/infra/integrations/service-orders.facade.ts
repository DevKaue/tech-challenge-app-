import { Injectable } from '@nestjs/common';
import { ServiceOrdersPublicInterface } from '@service-orders/application/contracts/service-orders-public.interface';
import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';

@Injectable()
export class ServiceOrdersFacade implements ServiceOrdersPublicInterface {
  constructor(
    private readonly queryService: ServiceOrderQueryServiceInterface,
  ) {}

  async findServiceOrderById(id: string) {
    return this.queryService.findOne(id);
  }
}
