import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { DeliverVehicleUseCase } from '@service-orders/application/usecases/service-order/deliver-vehicle.use-case';

type DeliverVehicleRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class DeliverVehicleController implements Controller<
  DeliverVehicleRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly deliverVehicleUseCase: DeliverVehicleUseCase) {}

  async handle(
    httpRequest: DeliverVehicleRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.deliverVehicleUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
