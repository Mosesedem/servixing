-- AlterEnum
ALTER TYPE "DropoffType" ADD VALUE 'ONSITE';

-- AlterTable
ALTER TABLE "work_orders" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT;
