import CreateMaterialUseCase, {
  CreateMaterialInput,
} from '@materials/application/usecases/create-material.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type CreateMaterialRequest = HttpRequest<
  CreateMaterialInput,
  undefined,
  undefined
>;

export default class CreateMaterialController implements Controller<
  CreateMaterialRequest,
  MaterialResponse
> {
  constructor(private readonly createMaterialUseCase: CreateMaterialUseCase) {}

  async handle(
    httpRequest: CreateMaterialRequest,
  ): Promise<HttpResponse<MaterialResponse>> {
    const output = await this.createMaterialUseCase.execute(httpRequest.body);

    return {
      statusCode: 201,
      body: JsonMaterialPresenter.present(output.material),
    };
  }
}
