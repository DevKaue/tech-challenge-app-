/*
  Warnings:

  - You are about to drop the column `client_id` on the `service_orders` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the `clients` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customer_id` to the `service_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customer_id` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "service_orders" DROP CONSTRAINT "service_orders_client_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_client_id_fkey";

-- DropIndex
DROP INDEX "idx_service_orders_client_id";

-- AlterTable
ALTER TABLE "service_orders" DROP COLUMN "client_id",
ADD COLUMN     "customer_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "client_id",
ADD COLUMN     "customer_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "clients";

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_document_document_type_key" ON "customers"("document", "document_type");

-- CreateIndex
CREATE INDEX "idx_service_orders_customer_id" ON "service_orders"("customer_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
