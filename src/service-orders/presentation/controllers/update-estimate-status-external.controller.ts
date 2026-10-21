import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { EstimateResponseDto } from '@service-orders/application/dto/estimate/estimate-response.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { UpdateEstimateStatusExternalDto } from '@service-orders/application/dto/estimate/update-estimate-status-external.dto';
import { UpdateEstimateStatusUseCase } from '@service-orders/application/usecases/estimate/update-estimate-status.use-case';
import { RejectEstimateUseCase } from '@service-orders/application/usecases/estimate/reject-estimate.use-case';
import { ServiceOrdersRepositoryInterface } from '@service-orders/domain/contracts/service-orders-repository.interface';
import { EstimateStatus } from '@service-orders/domain/enums/estimate-status.enum';
import { EstimateNotFoundException } from '@service-orders/application/exceptions/estimate-not-found.exception';

const EXTERNAL_REJECT_REASON = 'Recusado via notificação externa';

type UpdateEstimateStatusExternalRequest = HttpRequest<
  UpdateEstimateStatusExternalDto,
  { estimateId: string },
  undefined
>;

type UpdateEstimateStatusExternalResponse =
  | EstimateResponseDto
  | ServiceOrderResponseDto;

export default class UpdateEstimateStatusExternalController implements Controller<
  UpdateEstimateStatusExternalRequest,
  UpdateEstimateStatusExternalResponse
> {
  constructor(
    private readonly updateEstimateStatusUseCase: UpdateEstimateStatusUseCase,
    private readonly rejectEstimateUseCase: RejectEstimateUseCase,
    private readonly repository: ServiceOrdersRepositoryInterface,
  ) {}

  async handle(
    httpRequest: UpdateEstimateStatusExternalRequest,
  ): Promise<HttpResponse<UpdateEstimateStatusExternalResponse>> {
    const { estimateId } = httpRequest.params;

    if (httpRequest.body.decision === EstimateStatus.REJECTED) {
      const estimate = await this.repository.findEstimateById(estimateId);
      if (!estimate) throw new EstimateNotFoundException(estimateId);

      const output = await this.rejectEstimateUseCase.execute(
        estimate.serviceOrderId,
        { reason: EXTERNAL_REJECT_REASON },
      );

      return {
        statusCode: 200,
        body: output,
      };
    }

    const output = await this.updateEstimateStatusUseCase.execute(estimateId, {
      status: httpRequest.body.decision,
    });

    return {
      statusCode: 200,
      body: output,
    };
  }
}
