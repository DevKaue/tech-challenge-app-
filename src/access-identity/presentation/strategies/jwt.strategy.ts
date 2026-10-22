import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ValidateAuthenticatedCustomerUseCase } from '../../application/usecases/validate-authenticated-customer.usecase';
import {
  ValidateAuthenticatedUserInput,
  ValidateAuthenticatedUserUseCase,
} from '../../application/usecases/validate-authenticated-user.usecase';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';

/** Valor de `type` nos tokens que a Lambda de CPF emite para clientes. */
const CUSTOMER_TOKEN_TYPE = 'customer';

type JwtPayload = ValidateAuthenticatedUserInput & { type?: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly validateAuthenticatedUserUseCase: ValidateAuthenticatedUserUseCase,
    private readonly validateAuthenticatedCustomerUseCase: ValidateAuthenticatedCustomerUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
      // Sem isto a biblioteca aceita qualquer HMAC (HS384, HS512) além do HS256
      // com que a aplicação e a Lambda assinam.
      algorithms: ['HS256'],
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<AuthenticatedUser | AuthenticatedCustomer> {
    try {
      return payload.type === CUSTOMER_TOKEN_TYPE
        ? await this.validateAuthenticatedCustomerUseCase.execute(payload)
        : await this.validateAuthenticatedUserUseCase.execute(payload);
    } catch (error) {
      // InvalidCredentialsException não é HttpException: o filtro de cada módulo
      // só a converte em 401 se tiver a entrada no próprio mapa, e os de clientes
      // e materiais não têm. Sem esta conversão, credencial inválida vira 500.
      if (error instanceof InvalidCredentialsException) {
        throw new UnauthorizedException();
      }
      throw error;
    }
  }
}
