-- AlterTable
ALTER TABLE "warranty_checks" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "coverageEnd" TIMESTAMP(3),
ADD COLUMN     "coverageStart" TIMESTAMP(3),
ADD COLUMN     "deviceStatus" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "warrantyExpiry" TIMESTAMP(3),
ADD COLUMN     "warrantyStatus" TEXT;
