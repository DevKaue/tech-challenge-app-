-- AlterEnum
ALTER TYPE "ServiceOrderStatus" ADD VALUE 'CLOSED';

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MECHANIC', 'ATTENDANT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "service_orders" ADD COLUMN "mecanico_id" TEXT;
ALTER TABLE "service_orders" ADD COLUMN "data_fechamento" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_mecanico_id_fkey" FOREIGN KEY ("mecanico_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


