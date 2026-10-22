import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CUSTOMER_ACCESS_KEY } from '../decorators/customer-access.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const customer = new AuthenticatedCustomer('customer-1');
  const attendant = new AuthenticatedUser(
    'user-1',
    'Ana Santos',
    'ana.santos@oficina.com',
    UserRole.ATTENDANT,
  );
  let reflector: jest.Mocked<Pick<Reflector, 'getAllAndOverride'>>;
  let guard: JwtAuthGuard;
  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new JwtAuthGuard(reflector as unknown as Reflector);
  });

  it('should forbid a customer on a route without @CustomerAccess()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(() => guard.handleRequest(null, customer, null, context)).toThrow(
      ForbiddenException,
    );
  });

  it('should let a customer through on a route marked with @CustomerAccess()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    expect(guard.handleRequest(null, customer, null, context)).toBe(customer);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      CUSTOMER_ACCESS_KEY,
      expect.any(Array),
    );
  });

  it('should not change the behavior for employees', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.handleRequest(null, attendant, null, context)).toBe(attendant);
  });

  it('should keep rejecting a request without a valid token', () => {
    expect(() =>
      guard.handleRequest(null, false, new Error('No auth token'), context),
    ).toThrow('Unauthorized');
  });
});
