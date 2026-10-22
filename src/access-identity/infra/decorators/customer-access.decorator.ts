import { SetMetadata } from '@nestjs/common';

export const CUSTOMER_ACCESS_KEY = 'customerAccess';

/**
 * Libera a rota para o token de CLIENTE (o da Lambda de CPF). Sem esta marca, o
 * `JwtAuthGuard` recusa o cliente com 403: a maioria das rotas não tem `@Roles`
 * e aceitaria qualquer principal autenticado.
 *
 * Quem usa a marca deve filtrar os dados pelo dono: `customerScopeOf(req)`.
 */
export const CustomerAccess = () => SetMetadata(CUSTOMER_ACCESS_KEY, true);
