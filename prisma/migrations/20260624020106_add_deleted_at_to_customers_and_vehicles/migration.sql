-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "deleted_at" TIMESTAMP(3);
