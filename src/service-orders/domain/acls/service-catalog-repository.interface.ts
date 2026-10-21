/**
 * @context parts
 *
 * Contrato que service-orders espera do bounded context parts.
 *
 * Responsabilidade do contexto parts:
 *   - Implementar esta interface em PrismaServiceCatalogRepository
 *   - Registrar SERVICE_CATALOG_REPOSITORY como provider no MaterialsModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const SERVICE_CATALOG_REPOSITORY = Symbol('SERVICE_CATALOG_REPOSITORY');

export interface ServiceCatalogRepository {
  findById(id: string): Promise<{
    id: string;
    price: number;
  } | null>;
}
