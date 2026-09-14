import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';
import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/access-identity/application/usecases/login.usecase';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

type LoginAdminRequest = HttpRequest<LoginUseCaseInput, undefined, undefined>;

export default class LoginAdminController implements Controller<
  LoginAdminRequest,
  LoginUseCaseOutput
> {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  async handle(
    httpRequest: LoginAdminRequest,
  ): Promise<HttpResponse<LoginUseCaseOutput>> {
    const output = await this.loginUseCase.execute(
      httpRequest.body,
      UserRole.ATTENDANT,
    );

    return {
      statusCode: 201,
      body: output,
    };
  }
}
