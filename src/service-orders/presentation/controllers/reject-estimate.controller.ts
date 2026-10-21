import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { RejectEstimateDto } from '@service-orders/application/dto/estimate/reject-estimate.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { RejectEstimateUseCase } from '@service-orders/application/usecases/estimate/reject-estimate.use-case';

type RejectEstimateRequest = HttpRequest<
  RejectEstimateDto,
  { id: string },
  undefined
>;

export default class RejectEstimateController implements Controller<
  RejectEstimateRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly rejectEstimateUseCase: RejectEstimateUseCase) {}

  async handle(
    httpRequest: RejectEstimateRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.rejectEstimateUseCase.execute(
      httpRequest.params.id,
      httpRequest.body,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
