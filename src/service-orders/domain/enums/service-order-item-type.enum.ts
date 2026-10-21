/**
 * Tipo de item de um orçamento. Mantém os mesmos valores do enum
 * ServiceOrderItemType do Prisma, mas vive no domínio para que contratos e
 * use-cases não dependam de @prisma/client em runtime.
 */
export enum ServiceOrderItemType {
  PART = 'PART',
  SERVICE = 'SERVICE',
}
