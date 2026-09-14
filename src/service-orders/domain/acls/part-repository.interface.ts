/**
 * @context materials
 *
 * Contrato que service-orders espera do bounded context materials.
 * O nome PART_REPOSITORY permanece porque o item de orcamento ainda usa
 * ServiceOrderItemType.PART para referenciar materiais fisicos.
 *
 * Responsabilidade do contexto materials:
 *   - Implementar esta interface em PrismaMaterialRepository
 *   - Registrar PART_REPOSITORY como provider no MaterialsModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const PART_REPOSITORY = Symbol('PART_REPOSITORY');

export interface PartRepository {
  findById(id: string): Promise<{
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
  } | null>;

  decrementStock(materialId: string, quantity: number): Promise<void>;

  incrementStock(materialId: string, quantity: number): Promise<void>;
}
