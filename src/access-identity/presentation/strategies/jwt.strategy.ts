import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import {
  ValidateAuthenticatedUserInput,
  ValidateAuthenticatedUserUseCase,
} from '../../application/usecases/validate-authenticated-user.usecase';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly validateAuthenticatedUserUseCase: ValidateAuthenticatedUserUseCase,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  validate(payload: ValidateAuthenticatedUserInput) {
    return this.validateAuthenticatedUserUseCase.execute(payload);
  }
}
