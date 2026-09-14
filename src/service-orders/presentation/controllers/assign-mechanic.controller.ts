import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { AssignMechanicDto } from '@service-orders/application/dto/mechanic/assign-mechanic.dto';
import { ServiceOrderResponseDto } from '@service-orders/application/dto/service-order/service-order-response.dto';
import { AssignMechanicUseCase } from '@service-orders/application/usecases/mechanic/assign-mechanic.use-case';

type AssignMechanicRequest = HttpRequest<
  AssignMechanicDto,
  { id: string },
  undefined
>;

export default class AssignMechanicController implements Controller<
  AssignMechanicRequest,
  ServiceOrderResponseDto
> {
  constructor(private readonly assignMechanicUseCase: AssignMechanicUseCase) {}

  async handle(
    httpRequest: AssignMechanicRequest,
  ): Promise<HttpResponse<ServiceOrderResponseDto>> {
    const output = await this.assignMechanicUseCase.execute(
      httpRequest.params.id,
      httpRequest.body,
    );

    return {
      statusCode: 200,
      body: output,
    };
  }
}
