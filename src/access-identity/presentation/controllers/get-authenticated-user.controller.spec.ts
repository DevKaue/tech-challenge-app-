import GetAuthenticatedUserController from '@/access-identity/presentation/controllers/get-authenticated-user.controller';
import type { AuthenticatedUser } from '@/access-identity/domain/entities/authenticated-user.entity';
import { UserRole } from '@/access-identity/domain/enums/user-role.enum';

describe('GetAuthenticatedUserController', () => {
  it('retorna 200 projetando o usuario autenticado da requisicao', async () => {
    // Arrange
    const controller = new GetAuthenticatedUserController();
    const authenticatedUser = {
      userId: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      role: UserRole.MECHANIC,
    } as AuthenticatedUser;

    // Act
    const response = await controller.handle({
      body: authenticatedUser,
      params: undefined,
      query: undefined,
    });

    // Assert
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      id: 'user-1',
      name: 'Ana',
      email: 'ana@example.com',
      role: UserRole.MECHANIC,
    });
  });
});
