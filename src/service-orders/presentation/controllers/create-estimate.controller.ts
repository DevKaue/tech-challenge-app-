import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { CreateEstimateUseCase } from '@service-orders/application/usecases/estimate/create-estimate.use-case';

type CreateEstimateRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class CreateEstimateController implements Controller<
  CreateEstimateRequest,
  EstimateResponseDto
> {
  constructor(private readonly createEstimateUseCase: CreateEstimateUseCase) {}

  async handle(
    httpRequest: CreateEstimateRequest,
  ): Promise<HttpResponse<EstimateResponseDto>> {
    const output = await this.createEstimateUseCase.execute(
      httpRequest.params.id,
    );

    return {
      statusCode: 201,
      body: output,
    };
  }
}
