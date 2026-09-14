import UpdateMaterialUseCase, {
  UpdateMaterialInput,
} from '@materials/application/usecases/update-material.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type UpdateMaterialRequest = HttpRequest<
  Omit<UpdateMaterialInput, 'id'>,
  { id: string },
  undefined
>;

export default class UpdateMaterialController implements Controller<
  UpdateMaterialRequest,
  MaterialResponse
> {
  constructor(private readonly updateMaterialUseCase: UpdateMaterialUseCase) {}

  async handle(
    httpRequest: UpdateMaterialRequest,
  ): Promise<HttpResponse<MaterialResponse>> {
    const output = await this.updateMaterialUseCase.execute({
      ...httpRequest.body,
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonMaterialPresenter.present(output.material),
    };
  }
}
