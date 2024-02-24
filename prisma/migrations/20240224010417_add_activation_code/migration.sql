-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "activated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "activationCode" TEXT NOT NULL DEFAULT '';
