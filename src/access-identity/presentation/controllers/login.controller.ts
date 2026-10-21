import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/access-identity/application/usecases/login.usecase';

type LoginRequest = HttpRequest<LoginUseCaseInput, undefined, undefined>;

export default class LoginController implements Controller<
  LoginRequest,
  LoginUseCaseOutput
> {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(
    httpRequest: LoginRequest,
  ): Promise<HttpResponse<LoginUseCaseOutput>> {
    const output = await this.loginUseCase.execute(httpRequest.body);

    return {
      statusCode: 201,
      body: output,
    };
  }
}
