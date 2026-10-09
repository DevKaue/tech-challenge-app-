-- Fase 3: status do cliente, lido pela Lambda de autenticação por CPF
-- (SELECT id, status, deleted_at FROM customers) e pelo JwtStrategy.
--
-- DEFAULT 'ACTIVE' preenche as linhas existentes no mesmo comando: todo cliente
-- cadastrado antes desta migration continua podendo autenticar.

-- CreateEnum
CREATE TYPE "CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN "status" "CustomerStatus" NOT NULL DEFAULT 'ACTIVE';
