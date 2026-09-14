import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { StartServiceUseCase } from '@service-orders/application/usecases/service-order/start-service.use-case';

type StartServiceRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class StartServiceController implements Controller<
  StartServiceRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly startServiceUseCase: StartServiceUseCase) {}

  async handle(
    httpRequest: StartServiceRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.startServiceUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
