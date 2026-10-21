import DeleteMaterialUseCase from '@materials/application/usecases/delete-material.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type DeleteMaterialRequest = HttpRequest<undefined, { id: string }, undefined>;

export default class DeleteMaterialController implements Controller<
  DeleteMaterialRequest,
  MaterialResponse
> {
  constructor(private readonly deleteMaterialUseCase: DeleteMaterialUseCase) {}

  async handle(
    httpRequest: DeleteMaterialRequest,
  ): Promise<HttpResponse<MaterialResponse>> {
    const output = await this.deleteMaterialUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonMaterialPresenter.present(output.material),
    };
  }
}
