import UpdateVehicleUseCase, {
  UpdateVehicleInput,
} from '@/customer-management/application/usecases/update-vehicle.usecase';
import {
  JsonVehiclePresenter,
  VehicleResponse,
} from '@/customer-management/presentation/presenters/json-vehicle.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type UpdateVehicleRequest = HttpRequest<
  Omit<UpdateVehicleInput, 'id'>,
  { id: string },
  undefined
>;

export default class UpdateVehicleController implements Controller<
  UpdateVehicleRequest,
  VehicleResponse
> {
  constructor(private readonly updateVehicleUseCase: UpdateVehicleUseCase) {}

  async handle(
    httpRequest: UpdateVehicleRequest,
  ): Promise<HttpResponse<VehicleResponse>> {
    const output = await this.updateVehicleUseCase.execute({
      ...httpRequest.body,
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonVehiclePresenter.present(output.vehicle),
    };
  }
}
