import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { UpdateEstimateStatusDto } from '@service-orders/application/dto/estimate/update-estimate-status.dto';
import { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';

type UpdateEstimateStatusRequest = HttpRequest<
  UpdateEstimateStatusDto,
  { estimateId: string },
  undefined
>;

export default class UpdateEstimateStatusController implements Controller<
  UpdateEstimateStatusRequest,
  EstimateResponseDto
> {
  constructor(
    private readonly updateEstimateStatusUseCase: UpdateEstimateStatusUseCase,
  ) {}

  async handle(
    httpRequest: UpdateEstimateStatusRequest,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    const output = await this.updateEstimateStatusUseCase.execute(
      httpRequest.params.estimateId,
      httpRequest.body,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
