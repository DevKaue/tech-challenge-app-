import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenPayload,
  TokenService,
} from '../../domain/contracts/token-service.interface';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(payload: AccessTokenPayload): string {
    return this.jwtService.sign(payload);
  }
}
