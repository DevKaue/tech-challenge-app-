import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { EstimateItemDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { AddEstimateItemDto } from '@service-orders/application/dto/estimate/add-estimate-item.dto';
import { AddEstimateItemUseCase } from '@service-orders/application/usecases/estimate/add-estimate-item.use-case';

type AddEstimateItemRequest = HttpRequest<
  AddEstimateItemDto,
  { estimateId: string },
  undefined
>;

export default class AddEstimateItemController implements Controller<
  AddEstimateItemRequest,
  EstimateItemDto
> {
  constructor(
    private readonly addEstimateItemUseCase: AddEstimateItemUseCase,
  ) {}

  async handle(
    httpRequest: AddEstimateItemRequest,
  ): Promise<HttpResponse<EstimateItemDto>> {
    const output = await this.addEstimateItemUseCase.execute(
      httpRequest.params.estimateId,
      httpRequest.body,
    );

    return {
      statusCode: 201,
      body: output,
    };
  }
}
