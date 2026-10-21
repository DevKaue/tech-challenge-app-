import { ServiceOrderQueryServiceInterface } from '@service-orders/application/contracts/service-order-query-service.interface';
import { ServiceOrderNotFoundException } from '@service-orders/application/exceptions/service-order-not-found.exception';

export class GetServiceOrderStatusUseCase {
  constructor(
    private readonly queryService: ServiceOrderQueryServiceInterface,
  ) {}

  async execute(id: string) {
    const status = await this.queryService.findStatus(id);
    if (!status) throw new ServiceOrderNotFoundException(id);
    return status;
  }
}
