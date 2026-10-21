/**
 * Valores padrão de ambiente para os testes, carregado via `setupFiles` nas três
 * configurações do Jest (unit, integração e e2e).
 *
 * Sem isto, `npm test` falha nos testes do ScryptPasswordHasher (que exige
 * PASSWORD_SALT) e as suítes que sobem a aplicação estouram em `validateEnv()`,
 * que exige DATABASE_URL e JWT_SECRET — o desenvolvedor precisava exportar as
 * variáveis à mão antes de rodar qualquer suíte.
 *
 * O uso de `??=` garante que o ambiente real tem precedência: dentro do
 * docker-compose e no CI, os valores já definidos são preservados. O default do
 * banco aponta para a porta publicada pelo compose no host (5433), que é o
 * cenário de quem roda os testes fora do container.
 */
process.env.DATABASE_URL ??=
  'postgresql://admin:adminpassword@localhost:5433/oficinadb_test?schema=public';
process.env.JWT_SECRET ??= 'test-secret';
process.env.PASSWORD_SALT ??= 'test-salt';
process.env.WEBHOOK_SECRET ??= 'test-webhook-secret';
