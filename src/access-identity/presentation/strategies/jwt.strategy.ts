import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ValidateAuthenticatedUserInput,
  ValidateAuthenticatedUserUseCase,
} from '../../application/usecases/validate-authenticated-user.usecase';
import {
  ValidateAuthenticatedCustomerInput,
  ValidateAuthenticatedCustomerUseCase,
} from '../../application/usecases/validate-authenticated-customer.usecase';

// Os dois emissores da RFC-001. São as mesmas `key` dos KongConsumers
// app-staff e auth-lambda: um terceiro emissor precisa entrar nos dois lugares.
export const STAFF_TOKEN_ISSUER = 'techchallenge-app';
export const CUSTOMER_TOKEN_ISSUER = 'techchallenge-auth-lambda';

type JwtPayload = ValidateAuthenticatedUserInput &
  ValidateAuthenticatedCustomerInput & { iss?: string };

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
      // Lista explícita: sem ela o passport-jwt aceita qualquer algoritmo HMAC
      // com o mesmo segredo, e sem `issuer` aceita token sem `iss`, que o Kong
      // já recusa. A aplicação valida igual ao gateway (defesa em profundidade).
      algorithms: ['HS256'],
      issuer: [STAFF_TOKEN_ISSUER, CUSTOMER_TOKEN_ISSUER],
    });
  }

  validate(payload: JwtPayload) {
    // O emissor decide a tabela: o `sub` do cliente é um id de `customers`, e
    // procurá-lo em `users` (como antes) rejeitava todo token da Lambda.
    if (payload.iss === CUSTOMER_TOKEN_ISSUER) {
      return this.validateAuthenticatedCustomerUseCase.execute(payload);
    }
    return this.validateAuthenticatedUserUseCase.execute(payload);
  }
}
