import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '@/common/infra/prisma/prisma.service';
import { USER_REPOSITORY } from '@service-orders/domain/acls/user-repository.interface';
import { LoginUseCase } from './application/usecases/login.usecase';
import { ValidateAuthenticatedUserUseCase } from './application/usecases/validate-authenticated-user.usecase';
import { ACCESS_IDENTITY_REPOSITORY } from './domain/contracts/access-identity-repository.interface';
import type { AccessIdentityRepository } from './domain/contracts/access-identity-repository.interface';
import { PASSWORD_HASHER } from './domain/contracts/password-hasher.interface';
import { TOKEN_SERVICE } from './domain/contracts/token-service.interface';
import { PrismaAccessIdentityRepository } from './infra/repositories/prisma-access-identity.repository';
import { JwtTokenService } from './infra/security/jwt-token.service';
import { ScryptPasswordHasher } from './infra/security/scrypt-password-hasher';
import { AuthInfraController } from './infra/controllers/auth.controller';
import LoginController from './presentation/controllers/login.controller';
import LoginAdminController from './presentation/controllers/login-admin.controller';
import GetAuthenticatedUserController from './presentation/controllers/get-authenticated-user.controller';
import { JwtAuthGuard } from './infra/guards/jwt-auth.guard';
import { RolesGuard } from './infra/guards/roles.guard';
import { JwtStrategy } from './presentation/strategies/jwt.strategy';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { EXCEPTION_STATUS_MAP } from '@/common/infra/filters/exception-status.map';
import { accessIdentityStatusMap } from '@/access-identity/infra/filters/access-identity-status.map';
import { createProvider } from '@/common/infra/di/create-provider';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [
    { provide: EXCEPTION_STATUS_MAP, useValue: accessIdentityStatusMap },
    DomainExceptionFilter,
    createProvider(LoginUseCase, [
      ACCESS_IDENTITY_REPOSITORY,
      PASSWORD_HASHER,
      TOKEN_SERVICE,
    ]),
    createProvider(ValidateAuthenticatedUserUseCase, [
      ACCESS_IDENTITY_REPOSITORY,
    ]),
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: ACCESS_IDENTITY_REPOSITORY,
      useClass: PrismaAccessIdentityRepository,
    },
    {
      provide: PASSWORD_HASHER,
      useClass: ScryptPasswordHasher,
    },
    {
      provide: TOKEN_SERVICE,
      useClass: JwtTokenService,
    },
    createProvider(LoginController, [LoginUseCase]),
    createProvider(LoginAdminController, [LoginUseCase]),
    createProvider(GetAuthenticatedUserController),

    // ACL adapter exposto para service-orders (validação/atribuição de mecânico).
    {
      provide: USER_REPOSITORY,
      useFactory: (
        repository: AccessIdentityRepository,
        prisma: PrismaService,
      ) => ({
        findById: async (id: string) => {
          const user = await repository.findById(id);
          return user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null;
        },
        updateAvailability: async (userId: string, available: boolean) => {
          await prisma.user.update({
            where: { id: userId },
            data: { available },
          });
        },
      }),
      inject: [ACCESS_IDENTITY_REPOSITORY, PrismaService],
    },
  ],
  controllers: [AuthInfraController],
  exports: [JwtAuthGuard, RolesGuard, USER_REPOSITORY],
})
export class AccessIdentityModule {}
