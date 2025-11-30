-- AlterTable
ALTER TABLE "parts" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "warranty_checks" ALTER COLUMN "workOrderId" DROP NOT NULL;
