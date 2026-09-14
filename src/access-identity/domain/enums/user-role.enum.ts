/**
 * Enum de domínio para o papel do usuário interno.
 *
 * Mantém os mesmos valores do enum UserRole do Prisma, mas vive na camada de
 * domínio para que entidades/use-cases não dependam de @prisma/client (infra).
 * O mapeamento Prisma → domínio acontece apenas nos repositórios (infra).
 */
export enum UserRole {
  MECHANIC = 'MECHANIC',
  ATTENDANT = 'ATTENDANT',
}
