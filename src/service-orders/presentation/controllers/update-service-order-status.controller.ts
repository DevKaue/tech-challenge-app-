import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { UpdateServiceOrderStatusDto } from '@service-orders/application/dto/service-order/update-service-order-status.dto';
import { UpdateServiceOrderStatusUseCase } from '@service-orders/application/usecases/service-order/update-service-order-status.use-case';

type UpdateServiceOrderStatusBody = UpdateServiceOrderStatusDto & {
  userId: string;
  email: string;
};

type UpdateServiceOrderStatusRequest = HttpRequest<
  UpdateServiceOrderStatusBody,
  { id: string },
  undefined
>;

export default class UpdateServiceOrderStatusController implements Controller<
  UpdateServiceOrderStatusRequest,
  ServiceOrderResponseDto
> {
  constructor(
    private readonly updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
  ) {}

  async handle(
    httpRequest: UpdateServiceOrderStatusRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.updateServiceOrderStatusUseCase.execute(
      httpRequest.params.id,
      {
        status: httpRequest.body.status,
        notes: httpRequest.body.notes,
      },
      {
        id: httpRequest.body.userId,
        email: httpRequest.body.email,
      },
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
