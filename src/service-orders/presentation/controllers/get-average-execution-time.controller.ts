import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { GetAverageExecutionTimeUseCase } from '@service-orders/application/usecases/metrics/get-avetage-execution-time.use-case';

type GetAverageExecutionTimeOutput = {
  averageExecutionTimeMinutes: number;
  totalOrdersAnalyzed: number;
  message?: string;
};

type GetAverageExecutionTimeRequest = HttpRequest<
  undefined,
  undefined,
  undefined
>;

export default class GetAverageExecutionTimeController implements Controller<
  GetAverageExecutionTimeRequest,
  GetAverageExecutionTimeOutput
> {
  constructor(
    private readonly getAverageExecutionTimeUseCase: GetAverageExecutionTimeUseCase,
  ) {}

  async handle(): Promise<HttpResponse<GetAverageExecutionTimeOutput>> {
    const output =
      await this.getAverageExecutionTimeUseCase.getAverageExecutionTime();

    return {
      statusCode: 200,
      body: output,
    };
  }
}
