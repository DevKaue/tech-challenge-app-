import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { FindOneServiceOrderUseCase } from '@service-orders/application/usecases/service-order/find-one-service-order.use-case';
import {
  ServiceOrderDetailResponse,
  ServiceOrderPresenter,
} from '@service-orders/presentation/presenters/service-order.presenter';

type FindOneServiceOrderRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class FindOneServiceOrderController implements Controller<
  FindOneServiceOrderRequest,
  ServiceOrderDetailResponse
> {
  constructor(
    private readonly findOneServiceOrderUseCase: FindOneServiceOrderUseCase,
  ) {}

  async handle(
    httpRequest: FindOneServiceOrderRequest,
  ): Promise<HttpResponse<ServiceOrderDetailResponse>> {
    const output = await this.findOneServiceOrderUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: ServiceOrderPresenter.presentDetail(output),
    };
  }
}
