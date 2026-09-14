/**
 * @context customer-management
 *
 * Contrato que service-orders espera do bounded context customer-management.
 *
 * Responsabilidade do contexto customer-management:
 *   - Implementar esta interface em PrismaClientRepository
 *   - Registrar CUSTOMER_REPOSITORY como provider no CustomerManagementModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const CUSTOMER_REPOSITORY = Symbol('CUSTOMER_REPOSITORY');

export interface CustomerRepository {
  findById(id: string): Promise<{
    id: string;
    document: string;
    name: string;
    email: string | null;
    phone: string | null;
  } | null>;
}
