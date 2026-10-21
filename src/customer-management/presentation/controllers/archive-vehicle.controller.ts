import ArchiveVehicleUseCase from '@/customer-management/application/usecases/archive-vehicle.usecase';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type ArchiveVehicleRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class ArchiveVehicleController implements Controller<
  ArchiveVehicleRequest,
  undefined
> {
  constructor(private readonly archiveVehicleUseCase: ArchiveVehicleUseCase) {}

  async handle(
    httpRequest: ArchiveVehicleRequest,
  ): Promise<HttpResponse<undefined>> {
    await this.archiveVehicleUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 204,
      body: undefined,
    };
  }
}
