import ListVehicleUseCase from '@/customer-management/application/usecases/list-vehicle.usecase';
import {
  JsonVehiclePresenter,
  VehicleResponse,
} from '@/customer-management/presentation/presenters/json-vehicle.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type ListVehiclesRequest = HttpRequest<
  undefined,
  undefined,
  { customerId?: string }
>;

export default class ListVehiclesController implements Controller<
  ListVehiclesRequest,
  VehicleResponse[]
> {
  constructor(private readonly listVehiclesUseCase: ListVehicleUseCase) {}

  async handle(
    httpRequest: ListVehiclesRequest,
  ): Promise<HttpResponse<VehicleResponse[]>> {
    const output = await this.listVehiclesUseCase.execute({
      customerId: httpRequest.query.customerId ?? undefined,
    });

    return {
      statusCode: 200,
      body: JsonVehiclePresenter.presentMany(output.vehicles),
    };
  }
}
