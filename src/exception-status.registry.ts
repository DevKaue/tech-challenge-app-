import { ExceptionStatusMap } from '@/common/infra/filters/exception-status.map';
import { accessIdentityStatusMap } from '@/access-identity/infra/filters/access-identity-status.map';
import { customerManagementStatusMap } from '@/customer-management/infra/filters/customer-management-status.map';
import { materialsStatusMap } from '@/materials/infra/filters/materials-status.map';
import { serviceOrdersStatusMap } from '@/service-orders/infra/filters/service-orders-status.map';

/**
 * Composition root do mapeamento de exceções: é o único ponto que conhece todos
 * os bounded contexts, e existe para o filter global, que atende qualquer rota.
 *
 * Fica aqui, ao lado do `AppModule`, e não em `@common` — assim `@common`
 * continua sendo uma camada compartilhada sem conhecimento de domínio, e um
 * contexto extraído do monolito leva apenas o seu próprio mapa.
 */
export const allExceptionStatusMaps: ExceptionStatusMap = [
  ...accessIdentityStatusMap,
  ...customerManagementStatusMap,
  ...materialsStatusMap,
  ...serviceOrdersStatusMap,
];
