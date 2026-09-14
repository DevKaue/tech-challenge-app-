import FindMaterialByIdUseCase from '@materials/application/usecases/find-material-by-id.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type FindMaterialByIdRequest = HttpRequest<
  undefined,
  { id: string },
  undefined
>;

export default class FindMaterialByIdController implements Controller<
  FindMaterialByIdRequest,
  MaterialResponse
> {
  constructor(
    private readonly findMaterialByIdUseCase: FindMaterialByIdUseCase,
  ) {}

  async handle(
    httpRequest: FindMaterialByIdRequest,
  ): Promise<HttpResponse<MaterialResponse>> {
    const output = await this.findMaterialByIdUseCase.execute({
      id: httpRequest.params.id,
    });

    return {
      statusCode: 200,
      body: JsonMaterialPresenter.present(output.material),
    };
  }
}
