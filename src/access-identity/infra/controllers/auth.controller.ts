import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/access-identity/infra/guards/jwt-auth.guard';
import LoginController from '@/access-identity/presentation/controllers/login.controller';
import LoginAdminController from '@/access-identity/presentation/controllers/login-admin.controller';
import GetAuthenticatedUserController, {
  AuthenticatedUserResponse,
} from '@/access-identity/presentation/controllers/get-authenticated-user.controller';
import type { RequestWithUser } from '@/access-identity/presentation/interfaces/authenticated-user.interface';
import { adaptNestRoute } from '@/common/presentation/adapters/nest-route.adapter';
import type { HttpResponse } from '@/common/application/contracts/http';
import { DomainExceptionFilter } from '@/common/infra/filters/domain-exception.filter';
import { LoginDto } from '@/access-identity/presentation/dto/login.dto';
import {
  AuthApiControllerDocs,
  AuthApiLoginAdminDocs,
  AuthApiLoginDocs,
  AuthApiMeDocs,
} from '@/access-identity/infra/swaggers/auth-routes.swagger';
import type { LoginUseCaseOutput } from '@/access-identity/application/usecases/login.usecase';

@AuthApiControllerDocs()
@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthInfraController {
  constructor(
    private readonly loginController: LoginController,
    private readonly loginAdminController: LoginAdminController,
    private readonly getAuthenticatedUserController: GetAuthenticatedUserController,
  ) {}

  @Post('login')
  @AuthApiLoginDocs()
  login(@Body() loginDto: LoginDto): Promise<HttpResponse<LoginUseCaseOutput>> {
    return adaptNestRoute(this.loginController, {
      body: loginDto,
      params: undefined,
      query: undefined,
    });
  }

  @Post('login-admin')
  @AuthApiLoginAdminDocs()
  loginAdmin(
    @Body() loginDto: LoginDto,
  ): Promise<HttpResponse<LoginUseCaseOutput>> {
    return adaptNestRoute(this.loginAdminController, {
      body: loginDto,
      params: undefined,
      query: undefined,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @AuthApiMeDocs()
  me(
    @Req() request: RequestWithUser,
  ): Promise<HttpResponse<AuthenticatedUserResponse>> {
    return adaptNestRoute(this.getAuthenticatedUserController, {
      body: request.user,
      params: undefined,
      query: undefined,
    });
  }
}
