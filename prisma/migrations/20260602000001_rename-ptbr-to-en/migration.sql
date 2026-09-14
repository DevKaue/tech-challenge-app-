-- Rename PT-BR column names to English
-- Migrate cpf_cnpj to document + document_type composite

-- 1. Drop FK referencing mecanico_id before rename
ALTER TABLE "service_orders" DROP CONSTRAINT IF EXISTS "service_orders_mecanico_id_fkey";

-- 2. Create DocumentType enum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ', 'PASSPORT', 'RNE');

-- 3. Add temporary nullable columns
ALTER TABLE "clients" ADD COLUMN "document" VARCHAR;
ALTER TABLE "clients" ADD COLUMN "document_type" "DocumentType";

-- 4. Migrate existing data — detect CPF (11 digits) vs CNPJ (14 digits)
UPDATE "clients" SET
  "document" = "cpf_cnpj",
  "document_type" = CASE
    WHEN LENGTH(REGEXP_REPLACE("cpf_cnpj", '\D', '', 'g')) = 11 THEN CAST('CPF' AS "DocumentType")
    ELSE CAST('CNPJ' AS "DocumentType")
  END;

-- 5. Make columns NOT NULL
ALTER TABLE "clients" ALTER COLUMN "document" SET NOT NULL;
ALTER TABLE "clients" ALTER COLUMN "document_type" SET NOT NULL;

-- 6. Drop old unique index
DROP INDEX IF EXISTS "clients_cpf_cnpj_key";

-- 7. Add composite unique
ALTER TABLE "clients" ADD CONSTRAINT "uq_client_document" UNIQUE ("document", "document_type");

-- 8. Drop old column
ALTER TABLE "clients" DROP COLUMN "cpf_cnpj";

-- 9. Rename columns in service_orders
ALTER TABLE "service_orders" RENAME COLUMN "mecanico_id" TO "mechanic_id";
ALTER TABLE "service_orders" RENAME COLUMN "data_fechamento" TO "closed_at";

-- 10. Re-create FK with new column name
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_mechanic_id_fkey" FOREIGN KEY ("mechanic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
