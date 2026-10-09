import {
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { AuthenticatedCustomer } from '../../domain/entities/authenticated-customer.entity';
import { AuthenticatedUser } from '../../domain/entities/authenticated-user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { CustomerAccessRule } from '../decorators/customer-access.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const prisma = {
    serviceOrder: { findUnique: jest.fn() },
    estimate: { findUnique: jest.fn() },
  };
  const reflector = { getAllAndOverride: jest.fn() };
  let guard: JwtAuthGuard;

  function context(
    user: unknown,
    params: Record<string, string> = {},
  ): ExecutionContext {
    return {
      switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
      getHandler: () => undefined,
      getClass: () => undefined,
    } as unknown as ExecutionContext;
  }

  function withRule(rule: CustomerAccessRule | undefined) {
    reflector.getAllAndOverride.mockReturnValue(rule);
  }

  beforeEach(() => {
    jest.restoreAllMocks();
    prisma.serviceOrder.findUnique.mockReset();
    prisma.estimate.findUnique.mockReset();
    reflector.getAllAndOverride.mockReset();
    // A autenticação do passport é testada pela própria lib; aqui interessa o
    // que acontece DEPOIS que o token é aceito.
    jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockResolvedValue(true);
    guard = new JwtAuthGuard(
      reflector as unknown as Reflector,
      prisma as unknown as PrismaService,
    );
  });

  it('should let staff through without checking customer rules', async () => {
    const staff = new AuthenticatedUser(
      'user-1',
      'Ana',
      'ana@oficina.com',
      UserRole.ATTENDANT,
    );

    await expect(guard.canActivate(context(staff))).resolves.toBe(true);
    expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
  });

  it('should deny a customer on a route without @CustomerAccess', async () => {
    withRule(undefined);

    await expect(
      guard.canActivate(context(new AuthenticatedCustomer('customer-1'))),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should allow a customer on their own service order', async () => {
    withRule({ resource: 'service-order', param: 'id' });
    prisma.serviceOrder.findUnique.mockResolvedValue({
      customerId: 'customer-1',
    });

    await expect(
      guard.canActivate(
        context(new AuthenticatedCustomer('customer-1'), { id: 'os-1' }),
      ),
    ).resolves.toBe(true);
    expect(
      (prisma.serviceOrder.findUnique.mock.calls as unknown[][])[0]?.[0],
    ).toMatchObject({
      where: { id: 'os-1' },
    });
  });

  it("should answer 404 for another customer's service order", async () => {
    withRule({ resource: 'service-order', param: 'id' });
    prisma.serviceOrder.findUnique.mockResolvedValue({
      customerId: 'customer-2',
    });

    await expect(
      guard.canActivate(
        context(new AuthenticatedCustomer('customer-1'), { id: 'os-1' }),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should answer 404 when the service order does not exist', async () => {
    withRule({ resource: 'service-order', param: 'id' });
    prisma.serviceOrder.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(
        context(new AuthenticatedCustomer('customer-1'), { id: 'os-x' }),
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('should check estimate ownership through its service order', async () => {
    withRule({ resource: 'estimate', param: 'estimateId' });
    prisma.estimate.findUnique.mockResolvedValue({
      serviceOrder: { customerId: 'customer-1' },
    });

    await expect(
      guard.canActivate(
        context(new AuthenticatedCustomer('customer-1'), {
          estimateId: 'est-1',
        }),
      ),
    ).resolves.toBe(true);
    expect(
      (prisma.estimate.findUnique.mock.calls as unknown[][])[0]?.[0],
    ).toMatchObject({
      where: { id: 'est-1' },
    });
  });

  it('should answer 404 when the route param is missing', async () => {
    withRule({ resource: 'service-order', param: 'id' });

    await expect(
      guard.canActivate(context(new AuthenticatedCustomer('customer-1'))),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.serviceOrder.findUnique).not.toHaveBeenCalled();
  });

  it('should turn InvalidCredentialsException from the strategy into 401', () => {
    expect(() =>
      guard.handleRequest(new InvalidCredentialsException(), false),
    ).toThrow(UnauthorizedException);
  });

  it('should answer 401 when passport finds no user', () => {
    expect(() => guard.handleRequest(null, false)).toThrow(
      UnauthorizedException,
    );
  });

  it('should not run customer rules when authentication fails', async () => {
    jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockResolvedValue(false);

    await expect(guard.canActivate(context(undefined))).resolves.toBe(false);
    expect(reflector.getAllAndOverride).not.toHaveBeenCalled();
  });
});
