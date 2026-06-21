ALTER TABLE "Order"
ADD COLUMN "shippingCarrier" TEXT,
ADD COLUMN "trackingNumber" TEXT,
ADD COLUMN "shippedAt" TIMESTAMP(3),
ADD COLUMN "deliveredAt" TIMESTAMP(3),
ADD COLUMN "cancelledAt" TIMESTAMP(3),
ADD COLUMN "cancelReason" TEXT,
ADD COLUMN "stockRestoredAt" TIMESTAMP(3);
