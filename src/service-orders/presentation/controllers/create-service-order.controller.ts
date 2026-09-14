import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { CreateServiceOrderDto } from '@service-orders/application/dto/service-order/create-service-order.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { CreateServiceOrderUseCase } from '@service-orders/application/usecases/service-order/create-service-order.use-case';

type CreateServiceOrderRequest = HttpRequest<
  CreateServiceOrderDto,
  undefined,
  undefined
>;

export default class CreateServiceOrderController implements Controller<
  CreateServiceOrderRequest,
  ServiceOrderResponseDto
> {
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
  ) {}

  async handle(
    httpRequest: CreateServiceOrderRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.createServiceOrderUseCase.execute(
      httpRequest.body,
    );

    return {
      statusCode: 201,
      body: output,
    };
  }
}
