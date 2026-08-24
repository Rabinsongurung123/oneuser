/*
  Warnings:

  - You are about to drop the column `author` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `availableCopies` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `copies` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `shelf` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `Borrow` table. All the data in the column will be lost.
  - Added the required column `copyId` to the `Borrow` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CopyCondition" AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- CreateEnum
CREATE TYPE "CopyStatus" AS ENUM ('AVAILABLE', 'CHECKED_OUT', 'RESERVED', 'IN_TRANSIT', 'WITHDRAWN');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "Borrow" DROP CONSTRAINT "Borrow_bookId_fkey";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "author",
DROP COLUMN "availableCopies",
DROP COLUMN "copies",
DROP COLUMN "shelf";

-- AlterTable
ALTER TABLE "Borrow" DROP COLUMN "bookId",
ADD COLUMN     "copyId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "fulfilledCopyId" TEXT;

-- CreateTable
CREATE TABLE "Copy" (
    "id" TEXT NOT NULL,
    "barcode" TEXT NOT NULL,
    "condition" "CopyCondition" NOT NULL DEFAULT 'GOOD',
    "shelfLocation" TEXT,
    "status" "CopyStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "bookId" TEXT NOT NULL,

    CONSTRAINT "Copy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Copy_barcode_key" ON "Copy"("barcode");

-- AddForeignKey
ALTER TABLE "Copy" ADD CONSTRAINT "Copy_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Borrow" ADD CONSTRAINT "Borrow_copyId_fkey" FOREIGN KEY ("copyId") REFERENCES "Copy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_fulfilledCopyId_fkey" FOREIGN KEY ("fulfilledCopyId") REFERENCES "Copy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
