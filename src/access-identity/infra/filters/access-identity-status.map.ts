import { HttpStatus } from '@nestjs/common';
import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { ForbiddenRoleException } from '@/access-identity/domain/exceptions/forbidden-role.exception';
import { InvalidCredentialsException } from '@/access-identity/domain/exceptions/invalid-credentials.exception';

export const accessIdentityStatusMap: ExceptionStatusMap = [
  [InvalidCredentialsException, HttpStatus.UNAUTHORIZED],
  [ForbiddenRoleException, HttpStatus.FORBIDDEN],
];
