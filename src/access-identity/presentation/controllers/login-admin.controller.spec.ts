import LoginAdminController from '@/access-identity/presentation/controllers/login-admin.controller';
import type { LoginUseCase } from '@/access-identity/application/usecases/login.usecase';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

describe('LoginAdminController', () => {
  it('retorna 201 e exige o papel de atendente', async () => {
    // Arrange
    const output = {
      access_token: 'jwt',
      token_type: 'Bearer',
      expires_in: 3600,
    };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new LoginAdminController({
      execute,
    } as unknown as LoginUseCase);
    const body = { email: 'admin@example.com', password: 'senha1234' };

    // Act
    const response = await controller.handle({
      body,
      params: undefined,
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith(body, UserRole.ATTENDANT);
  });
});
