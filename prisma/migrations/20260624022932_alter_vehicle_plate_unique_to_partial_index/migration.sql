/*
  Warnings:

  - A unique constraint covering the columns `[plate]` on the table `vehicles` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "vehicles_plate_key";

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_active_unique_idx" ON "vehicles"("plate") WHERE ("deleted_at" IS NULL);
