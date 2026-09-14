-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "document" SET DATA TYPE TEXT;

-- RenameIndex
ALTER INDEX "uq_client_document" RENAME TO "clients_document_document_type_key";
