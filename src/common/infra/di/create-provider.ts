import type { InjectionToken, Provider } from '@nestjs/common';

type Constructor<T> = new (...args: never[]) => T;

/**
 * Cria o provider de uma classe que o Nest não instancia sozinho — use cases e
 * controllers de apresentação, que são agnósticos do framework e por isso não
 * têm `@Injectable()`.
 *
 * Substitui o bloco que se repetia dezenas de vezes nos módulos:
 *
 * ```ts
 * {
 *   provide: CreateCustomerUseCase,
 *   useFactory: (repository: CustomerRepositoryInterface) =>
 *     new CreateCustomerUseCase(repository),
 *   inject: [CustomerRepositoryInterface],
 * }
 * ```
 *
 * que passa a ser:
 *
 * ```ts
 * createProvider(CreateCustomerUseCase, [CustomerRepositoryInterface])
 * ```
 */
export function createProvider<T>(
  target: Constructor<T>,
  inject: ReadonlyArray<InjectionToken> = [],
): Provider<T> {
  return {
    provide: target,
    useFactory: (...dependencies: never[]) => new target(...dependencies),
    inject: [...inject],
  };
}
