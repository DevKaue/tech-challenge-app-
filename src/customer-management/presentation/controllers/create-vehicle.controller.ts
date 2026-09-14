import {
  CreateVehicleInput,
  CreateVehicleUseCase,
} from '@/customer-management/application/usecases/create-vehicle.usecase';
import {
  JsonVehiclePresenter,
  VehicleResponse,
} from '@/customer-management/presentation/presenters/json-vehicle.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type CreateVehicleRequest = HttpRequest<
  Omit<CreateVehicleInput, 'customerId'>,
  { customerId: string },
  undefined
>;

export default class CreateVehicleController implements Controller<
  CreateVehicleRequest,
  VehicleResponse
> {
  constructor(private readonly createVehicleUseCase: CreateVehicleUseCase) {}

  async handle(
    httpRequest: CreateVehicleRequest,
  ): Promise<HttpResponse<VehicleResponse>> {
    const output = await this.createVehicleUseCase.execute({
      ...httpRequest.body,
      customerId: httpRequest.params.customerId,
    });

    return {
      statusCode: 201,
      body: JsonVehiclePresenter.present(output.vehicle),
    };
  }
}
