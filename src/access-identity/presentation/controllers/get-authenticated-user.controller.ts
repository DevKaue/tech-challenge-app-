import { AuthenticatedUser } from '@/access-identity/domain/entities/authenticated-user.entity';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';
import { Controller } from '@/common/application/contracts/controller';
import { HttpRequest, HttpResponse } from '@/common/application/contracts/http';

export type AuthenticatedUserResponse = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type GetAuthenticatedUserRequest = HttpRequest<
  AuthenticatedUser,
  undefined,
  undefined
>;

export default class GetAuthenticatedUserController implements Controller<
  GetAuthenticatedUserRequest,
  AuthenticatedUserResponse
> {
  async handle(
    httpRequest: GetAuthenticatedUserRequest,
  ): Promise<HttpResponse<AuthenticatedUserResponse>> {
    return {
      statusCode: 200,
      body: {
        id: httpRequest.body.userId,
        name: httpRequest.body.name,
        email: httpRequest.body.email,
        role: httpRequest.body.role,
      },
    };
  }
}
