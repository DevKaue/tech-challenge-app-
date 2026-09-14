-- AlterTable
ALTER TABLE "ServiceOrder" ADD COLUMN     "finishedExecutionAt" TIMESTAMP(3),
ADD COLUMN     "startedExecutionAt" TIMESTAMP(3);
