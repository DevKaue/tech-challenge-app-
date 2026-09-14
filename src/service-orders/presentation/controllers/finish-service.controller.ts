import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { FinishServiceOrderDto } from '@service-orders/application/dto/service-order/finish-service-order.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { FinishServiceUseCase } from '@service-orders/application/usecases/service-order/finish-service.use-case';

type FinishServiceBody = FinishServiceOrderDto & { mechanicId: string };
type FinishServiceRequest = HttpRequest<
  FinishServiceBody,
  { id: string },
  undefined
>;

export default class FinishServiceController implements Controller<
  FinishServiceRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly finishServiceUseCase: FinishServiceUseCase) {}

  async handle(
    httpRequest: FinishServiceRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.finishServiceUseCase.execute(
      httpRequest.params.id,
      httpRequest.body.mechanicId,
      httpRequest.body.notes,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
