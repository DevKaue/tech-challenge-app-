-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_customerId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrder" DROP CONSTRAINT "ServiceOrder_vehicleId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderItem" DROP CONSTRAINT "ServiceOrderItem_serviceCatalogId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderItem" DROP CONSTRAINT "ServiceOrderItem_serviceOrderId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderPart" DROP CONSTRAINT "ServiceOrderPart_partId_fkey";

-- DropForeignKey
ALTER TABLE "ServiceOrderPart" DROP CONSTRAINT "ServiceOrderPart_serviceOrderId_fkey";

-- DropForeignKey
ALTER TABLE "Vehicle" DROP CONSTRAINT "Vehicle_customerId_fkey";

-- DropTable
DROP TABLE "ServiceOrderPart";

-- DropTable
DROP TABLE "ServiceOrderItem";

-- DropTable
DROP TABLE "ServiceOrder";

-- DropTable
DROP TABLE "ServiceCatalog";

-- DropTable
DROP TABLE "Part";

-- DropTable
DROP TABLE "Vehicle";

-- DropTable
DROP TABLE "Client";

-- Now that all tables using ServiceOrderStatus are gone, alter the enum
CREATE TYPE "ServiceOrderStatus_new" AS ENUM ('RECEIVED', 'IN_DIAGNOSIS', 'WAITING_APPROVAL', 'IN_EXECUTION', 'FINISHED', 'DELIVERED');
ALTER TYPE "ServiceOrderStatus" RENAME TO "ServiceOrderStatus_old";
ALTER TYPE "ServiceOrderStatus_new" RENAME TO "ServiceOrderStatus";
DROP TYPE "ServiceOrderStatus_old";

-- CreateEnum
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NEGOTIATED');

-- CreateEnum
CREATE TYPE "ServiceOrderItemType" AS ENUM ('SERVICE', 'PART');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "cpf_cnpj" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "client_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_orders" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "status" "ServiceOrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "mileage" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_order_status_history" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "previous_status" "ServiceOrderStatus",
    "new_status" "ServiceOrderStatus" NOT NULL,
    "changed_by" VARCHAR(150),
    "notes" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimates" (
    "id" TEXT NOT NULL,
    "service_order_id" TEXT NOT NULL,
    "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING',
    "total_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valid_until" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estimates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimate_items" (
    "id" TEXT NOT NULL,
    "estimate_id" TEXT NOT NULL,
    "item_type" "ServiceOrderItemType" NOT NULL,
    "reference_id" TEXT NOT NULL,
    "description" VARCHAR(200) NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "total_price" DECIMAL(10,2) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "estimate_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_cpf_cnpj_key" ON "clients"("cpf_cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_key" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "idx_service_orders_client_id" ON "service_orders"("client_id");

-- CreateIndex
CREATE INDEX "idx_service_orders_vehicle_id" ON "service_orders"("vehicle_id");

-- CreateIndex
CREATE INDEX "idx_service_orders_status" ON "service_orders"("status");

-- CreateIndex
CREATE INDEX "idx_service_orders_created_at" ON "service_orders"("created_at");

-- CreateIndex
CREATE INDEX "idx_status_history_service_order_id" ON "service_order_status_history"("service_order_id");

-- CreateIndex
CREATE INDEX "idx_status_history_changed_at" ON "service_order_status_history"("changed_at");

-- CreateIndex
CREATE INDEX "idx_estimates_service_order_id" ON "estimates"("service_order_id");

-- CreateIndex
CREATE INDEX "idx_estimates_status" ON "estimates"("status");

-- CreateIndex
CREATE INDEX "idx_estimate_items_estimate_id" ON "estimate_items"("estimate_id");

-- CreateIndex
CREATE INDEX "idx_estimate_items_reference_id" ON "estimate_items"("reference_id");

-- CreateIndex
CREATE INDEX "idx_estimate_items_item_type" ON "estimate_items"("item_type");

-- CreateIndex
CREATE UNIQUE INDEX "estimate_items_estimate_id_item_type_reference_id_key" ON "estimate_items"("estimate_id", "item_type", "reference_id");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_order_status_history" ADD CONSTRAINT "service_order_status_history_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimates" ADD CONSTRAINT "estimates_service_order_id_fkey" FOREIGN KEY ("service_order_id") REFERENCES "service_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimate_items" ADD CONSTRAINT "estimate_items_estimate_id_fkey" FOREIGN KEY ("estimate_id") REFERENCES "estimates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Comments
COMMENT ON TABLE  service_orders            IS 'Core entity — tracks the full lifecycle of a vehicle service';
COMMENT ON COLUMN service_orders.client_id  IS 'Reference to clients domain — FK to be added on integration';
COMMENT ON COLUMN service_orders.vehicle_id IS 'Reference to vehicles domain — FK to be added on integration';
COMMENT ON COLUMN service_orders.status     IS 'Managed by the system — follows defined transition flow';
COMMENT ON COLUMN service_orders.mileage    IS 'Vehicle mileage at the time of check-in';

COMMENT ON TABLE  service_order_status_history                  IS 'Immutable log of every status transition for a service order';
COMMENT ON COLUMN service_order_status_history.previous_status  IS 'NULL only on service order creation';
COMMENT ON COLUMN service_order_status_history.changed_by       IS 'User or system that triggered the transition';

COMMENT ON TABLE  estimates                  IS 'Estimate generated after diagnosis — awaits client approval';
COMMENT ON COLUMN estimates.valid_until      IS 'Deadline for the client to approve the estimate';
COMMENT ON COLUMN estimates.approved_at      IS 'Filled when the client approves';
COMMENT ON COLUMN estimates.total_amount     IS 'Calculated from the sum of all estimate items';

COMMENT ON TABLE  estimate_items               IS 'Line items of an estimate — services or parts';
COMMENT ON COLUMN estimate_items.item_type     IS 'SERVICE or PART — determines which domain reference_id belongs to';
COMMENT ON COLUMN estimate_items.reference_id  IS 'Reference to services or domain — FK to be added on integration';
COMMENT ON COLUMN estimate_items.description   IS 'Snapshot of the item name at the time of estimate creation';
COMMENT ON COLUMN estimate_items.unit_price    IS 'Snapshot of the price at the time of estimate creation';
