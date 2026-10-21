import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

/**
 * Mock JWT Guard for e2e tests
 * Replaces the real JwtAuthGuard and RolesGuard to avoid token validation complexity in tests
 *
 * Usage in tests:
 * ```
 * .overrideGuard(JwtAuthGuard)
 * .useClass(MockJwtAuthGuard)
 * .overrideGuard(RolesGuard)
 * .useClass(MockJwtAuthGuard)
 * ```
 */
@Injectable()
export class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    const userRole = request.headers['x-user-role'] as string;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    // Simple check: just verify the header exists (Bearer token format not strictly validated)
    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header format');
    }

    // Check if the requested route requires ATTENDANT role
    // This is a simplified version - in real scenarios we'd check @Roles() decorators
    const requiredRoles = this.getRequiredRoles(context);

    if (requiredRoles.length > 0 && userRole) {
      if (!requiredRoles.includes(userRole)) {
        throw new ForbiddenException(
          `User role must be one of: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // Attach user to request for use in controllers
    (request as any).user = { role: userRole || UserRole.ATTENDANT };

    return true;
  }

  /**
   * Get required roles from metadata
   * In a real scenario, this would check the @Roles() decorator
   * For now, we assume all routes require ATTENDANT role
   */
  private getRequiredRoles(context: ExecutionContext): string[] {
    // This is a simplified version - you could enhance this by checking
    // the Reflector for @Roles() decorator metadata
    return [UserRole.ATTENDANT];
  }
}
