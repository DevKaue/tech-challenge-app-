import { SetMetadata } from '@nestjs/common';

export const CUSTOMER_ACCESS_KEY = 'customerAccess';

/**
 * Recurso cuja posse é conferida antes de liberar a rota para um cliente:
 * - `service-order`: o parâmetro é o id da OS;
 * - `estimate`: o parâmetro é o id do orçamento, e a posse é a da OS dele.
 */
export type CustomerOwnedResource = 'service-order' | 'estimate';

export type CustomerAccessRule = {
  resource: CustomerOwnedResource;
  param: string;
};

/**
 * Libera a rota para o token de cliente (Lambda de CPF), desde que o recurso do
 * parâmetro seja dele. Sem este decorator, o JwtAuthGuard nega cliente em
 * qualquer rota: a lista de rotas de cliente é explícita, e uma rota nova nasce
 * fechada para ele.
 */
export const CustomerAccess = (
  resource: CustomerOwnedResource,
  param: string,
) =>
  SetMetadata(CUSTOMER_ACCESS_KEY, {
    resource,
    param,
  } satisfies CustomerAccessRule);
