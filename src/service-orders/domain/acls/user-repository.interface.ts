/**
 * @context access-identity
 *
 * Contrato que service-orders espera do bounded context access-identity.
 *
 * Responsabilidade do contexto access-identity:
 *   - Implementar esta interface em PrismaUserRepository
 *   - Registrar USER_REPOSITORY como provider no AccessIdentityModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<{
    id: string;
    name: string;
    email: string;
    role: string;
  } | null>;

  updateAvailability(userId: string, available: boolean): Promise<void>;
}
