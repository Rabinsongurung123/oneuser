-- CreateEnum
CREATE TYPE "FineStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('WAITING', 'FULFILLED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('DUE_REMINDER', 'OVERDUE_ALERT', 'HOLD_READY');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- AlterEnum
ALTER TYPE "BorrowStatus" ADD VALUE 'OVERDUE';

-- CreateTable
CREATE TABLE "LibrarySettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "dailyFineRate" DECIMAL(10,2) NOT NULL DEFAULT 0.50,
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibrarySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fine" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "FineStatus" NOT NULL DEFAULT 'PENDING',
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "borrowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'WAITING',
    "reservedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "sentAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fine_borrowId_key" ON "Fine"("borrowId");

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_borrowId_fkey" FOREIGN KEY ("borrowId") REFERENCES "Borrow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
