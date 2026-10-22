export const CUSTOMER_IDENTITY_REPOSITORY = Symbol(
  'CUSTOMER_IDENTITY_REPOSITORY',
);

export interface CustomerIdentityRepository {
  /**
   * Cliente ATIVO e não arquivado: a mesma regra com que a Lambda emite o token.
   * Conferir de novo aqui, e não só confiar na assinatura, derruba na hora o
   * acesso de quem foi bloqueado ou arquivado depois de receber um token (1 h).
   */
  existsActive(id: string): Promise<boolean>;
}
