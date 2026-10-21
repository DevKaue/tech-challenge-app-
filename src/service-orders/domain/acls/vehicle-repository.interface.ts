/**
 * @context customer-management
 *
 * Contrato que service-orders espera do bounded context customer-management.
 *
 * Responsabilidade do contexto customer-management:
 *   - Implementar esta interface em PrismaVehicleRepository
 *   - Registrar VEHICLE_REPOSITORY como provider no CustomerManagementModule
 *   - Exportar o provider para que outros módulos possam injetá-lo
 */

export const VEHICLE_REPOSITORY = Symbol('VEHICLE_REPOSITORY');

export interface VehicleRepository {
  findById(id: string): Promise<{
    id: string;
    plate: string;
    brand: string;
    model: string;
    year: number;
    customerId: string;
  } | null>;
}
