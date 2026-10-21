import LoginController from '@/access-identity/presentation/controllers/login.controller';
import type { LoginUseCase } from '@/access-identity/application/usecases/login.usecase';

describe('LoginController', () => {
  it('retorna 201 com a saida do use case', async () => {
    // Arrange
    const output = {
      access_token: 'jwt',
      token_type: 'Bearer',
      expires_in: 3600,
    };
    const execute = jest.fn().mockResolvedValue(output);
    const controller = new LoginController({
      execute,
    } as unknown as LoginUseCase);
    const body = { email: 'user@example.com', password: 'senha1234' };

    // Act
    const response = await controller.handle({
      body,
      params: undefined,
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(201);
    expect(response.body).toBe(output);
    expect(execute).toHaveBeenCalledWith(body);
  });
});
