import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { StartDiagnosisDto } from '@service-orders/application/dto/diagnosis/start-diagnosis.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { StartDiagnosisUseCase } from '@service-orders/application/usecases/diagnosis/startDiagnosis.use-case';

type StartDiagnosisRequest = HttpRequest<
  StartDiagnosisDto,
  { id: string },
  undefined
>;

export default class StartDiagnosisController implements Controller<
  StartDiagnosisRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly startDiagnosisUseCase: StartDiagnosisUseCase) {}

  async handle(
    httpRequest: StartDiagnosisRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.startDiagnosisUseCase.startDiagnosis(
      httpRequest.params.id,
      httpRequest.body,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
