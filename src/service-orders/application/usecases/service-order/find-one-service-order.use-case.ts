import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

export class FindOneServiceOrderUseCase {
  constructor(
    private readonly queryService: ServiceOrderQueryServiceInterface,
  ) {}

  async execute(id: string) {
    const order = await this.queryService.findOne(id);
    if (!order) throw new ServiceOrderNotFoundException(id);
    return order;
  }
}
