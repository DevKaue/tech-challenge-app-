import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { GetServiceOrderStatusUseCase } from '@service-orders/application/usecases/service-order/get-service-order-status.use-case';
import { ServiceOrderStatusDto } from '@service-orders/application/dto/query/service-order-status.dto';

type GetServiceOrderStatusRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class GetServiceOrderStatusController implements Controller<
  GetServiceOrderStatusRequest,
  ServiceOrderStatusDto
> {
  constructor(
    private readonly getServiceOrderStatusUseCase: GetServiceOrderStatusUseCase,
  ) {}

  async handle(
    httpRequest: GetServiceOrderStatusRequest,
  ): Promise<HttpResponse<ServiceOrderStatusDto>> {
    const output = await this.getServiceOrderStatusUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
