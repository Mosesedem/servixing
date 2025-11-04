-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "featured_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "condition" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "seller" TEXT NOT NULL,
    "ebayUrl" TEXT NOT NULL,
    "brand" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "featured_items_active_idx" ON "featured_items"("active");

-- CreateIndex
CREATE INDEX "featured_items_createdAt_idx" ON "featured_items"("createdAt");
