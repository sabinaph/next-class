-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "khaltiPidx" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentGateway" TEXT DEFAULT 'KHALTI';
