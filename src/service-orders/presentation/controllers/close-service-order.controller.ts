import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CloseServiceOrderUseCase } from '@service-orders/application/usecases/service-order/close-service-order.use-case';

type CloseServiceOrderRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class CloseServiceOrderController implements Controller<
  CloseServiceOrderRequest,
  ServiceOrderResponseDto
> {
  constructor(
    private readonly closeServiceOrderUseCase: CloseServiceOrderUseCase,
  ) {}

  async handle(
    httpRequest: CloseServiceOrderRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.closeServiceOrderUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
