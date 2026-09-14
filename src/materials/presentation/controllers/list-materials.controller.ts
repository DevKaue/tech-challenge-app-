import ListMaterialsUseCase from '@materials/application/usecases/list-materials.usecase';
import {
  JsonMaterialPresenter,
  MaterialResponse,
} from '@materials/presentation/presenters/json-material.presenter';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

type ListMaterialsRequest = HttpRequest<undefined, undefined, undefined>;

export default class ListMaterialsController implements Controller<
  ListMaterialsRequest,
  MaterialResponse[]
> {
  constructor(private readonly listMaterialsUseCase: ListMaterialsUseCase) {}

  async handle(): Promise<HttpResponse<MaterialResponse[]>> {
    const output = await this.listMaterialsUseCase.execute();

    return {
      statusCode: 200,
      body: JsonMaterialPresenter.presentMany(output.materials),
    };
  }
}
