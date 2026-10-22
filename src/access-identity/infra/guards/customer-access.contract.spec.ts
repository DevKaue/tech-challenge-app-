import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { CUSTOMER_ACCESS_KEY } from '../decorators/customer-access.decorator';

/**
 * Contrato de segurança: o token de cliente (o da Lambda de CPF) só pode abrir
 * as rotas desta lista. Liberar outra exige mudar este teste, ou seja, passa por
 * revisão. A maioria das rotas não tem `@Roles` e aceitaria qualquer principal
 * autenticado, então o bloqueio por padrão do `JwtAuthGuard` é a única barreira.
 */
const CUSTOMER_ACCESSIBLE_ROUTES = [
  'EstimateInfraController.updateEstimateStatus',
  'ServiceOrderInfraController.findOne',
  'ServiceOrderInfraController.findStatus',
];

const SRC = join(__dirname, '../../..');

const controllerFiles = (readdirSync(SRC, { recursive: true }) as string[])
  .filter((file) =>
    /infra[\\/]controllers[\\/][^\\/]+\.controller\.ts$/.test(file),
  )
  .map((file) => join(SRC, file));

function hasCustomerAccess(target: object): boolean {
  return Reflect.getMetadata(CUSTOMER_ACCESS_KEY, target) === true;
}

function customerAccessibleHandlers(): string[] {
  return controllerFiles
    .flatMap((file) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const exported = require(file) as Record<string, unknown>;
      return Object.values(exported).filter(
        (value): value is new () => object => typeof value === 'function',
      );
    })
    .flatMap((controller) => {
      const wholeClass = hasCustomerAccess(controller);

      return Object.getOwnPropertyNames(controller.prototype)
        .filter((name) => {
          const handler = (controller.prototype as Record<string, unknown>)[
            name
          ];
          return (
            typeof handler === 'function' &&
            (wholeClass || hasCustomerAccess(handler))
          );
        })
        .map((name) => `${controller.name}.${name}`);
    })
    .sort();
}

describe('rotas liberadas para o token de cliente', () => {
  it('should scan the controllers that exist', () => {
    // Sem isto, um filtro quebrado por mudança de pasta passaria em branco.
    expect(controllerFiles.length).toBeGreaterThan(5);
  });

  it('should be exactly the approved list', () => {
    expect(customerAccessibleHandlers()).toEqual(CUSTOMER_ACCESSIBLE_ROUTES);
  });
});
