import FindVehicleByIdUseCase from '@/customer-management/application/usecases/find-vehicle-by-id.usecase';
import {
  JsonVehiclePresenter,
  VehicleResponse,
} from '@/customer-management/presentation/presenters/json-vehicle.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type FindVehicleByIdRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class FindVehicleByIdController implements Controller<
  FindVehicleByIdRequest,
  VehicleResponse
> {
  constructor(
    private readonly findVehicleByIdUseCase: FindVehicleByIdUseCase,
  ) {}

  async handle(
    httpRequest: FindVehicleByIdRequest,
  ): Promise<HttpResponse<VehicleResponse>> {
    const output = await this.findVehicleByIdUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonVehiclePresenter.present(output.vehicle),
    };
  }
}
