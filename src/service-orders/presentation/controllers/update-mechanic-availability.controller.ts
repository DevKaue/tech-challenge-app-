import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import { UpdateMechanicAvailabilityDto } from '@service-orders/application/dto/mechanic/update-mechanic-availability.dto';
import { UpdateMechanicAvailabilityUseCase } from '@service-orders/application/usecases/mechanic/update-mechanic-availability.use-case';

type UpdateMechanicAvailabilityRequest = HttpRequest<
  UpdateMechanicAvailabilityDto,
  { mechanicId: string },
  undefined
>;

export default class UpdateMechanicAvailabilityController implements Controller<
  UpdateMechanicAvailabilityRequest,
  undefined
> {
  constructor(
    private readonly updateMechanicAvailabilityUseCase: UpdateMechanicAvailabilityUseCase,
  ) {}

  async handle(
    httpRequest: UpdateMechanicAvailabilityRequest,
  ): Promise<HttpResponse<undefined>> {
    await this.updateMechanicAvailabilityUseCase.execute(
      httpRequest.params.mechanicId,
      httpRequest.body.available,
    );

    return {
      statusCode: 200,
      body: undefined,
    };
  }
}
