import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  AuthenticatedUserSwaggerResponse,
  HttpErrorSwaggerResponse,
  LoginSwaggerBody,
  LoginSwaggerResponse,
} from '@/access-identity/infra/swaggers/auth.swagger';

export function AuthApiControllerDocs(): ClassDecorator {
  return applyDecorators(ApiTags('Auth'));
}

export function AuthApiLoginDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: LoginSwaggerBody }),
    ApiCreatedResponse({
      description: 'Autenticacao realizada com sucesso',
      type: LoginSwaggerResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciais invalidas',
      type: HttpErrorSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada invalidos',
      type: HttpErrorSwaggerResponse,
    }),
  );
}

export function AuthApiLoginAdminDocs(): MethodDecorator {
  return applyDecorators(
    ApiBody({ type: LoginSwaggerBody }),
    ApiCreatedResponse({
      description: 'Autenticacao administrativa realizada com sucesso',
      type: LoginSwaggerResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Credenciais invalidas',
      type: HttpErrorSwaggerResponse,
    }),
    ApiForbiddenResponse({
      description: 'Perfil sem permissao para login administrativo',
      type: HttpErrorSwaggerResponse,
    }),
    ApiBadRequestResponse({
      description: 'Dados de entrada invalidos',
      type: HttpErrorSwaggerResponse,
    }),
  );
}

export function AuthApiMeDocs(): MethodDecorator {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Usuario autenticado',
      type: AuthenticatedUserSwaggerResponse,
    }),
  );
}
