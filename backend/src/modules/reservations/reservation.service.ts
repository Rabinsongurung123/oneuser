import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";

const HOLD_EXPIRY_DAYS = 3;

export async function createReservation(userId: string, bookId: string) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw ApiError.notFound(`Book with id '${bookId}' not found`);

  const existing = await prisma.reservation.findFirst({
    where: { userId, bookId, status: { in: ["WAITING", "FULFILLED"] } },
  });
  if (existing) throw ApiError.conflict("You already have an active reservation for this book");

  return prisma.reservation.create({ data: { userId, bookId, status: "WAITING" } });
}

export async function cancelReservation(id: string, userId: string) {
  const reservation = await prisma.reservation.findUnique({ where: { id } });
  if (!reservation) throw ApiError.notFound(`Reservation with id '${id}' not found`);
  if (reservation.userId !== userId) throw ApiError.forbidden("This is not your reservation");
  if (reservation.status !== "WAITING") {
    throw ApiError.conflict("Only a waiting reservation can be cancelled");
  }

  return prisma.reservation.update({ where: { id }, data: { status: "CANCELLED" } });
}

export function getMyReservations(userId: string) {
  return prisma.reservation.findMany({
    where: { userId },
    include: { book: true },
    orderBy: { reservedAt: "desc" },
  });
}

export function getAllReservations(skip: number, take: number) {
  return Promise.all([
    prisma.reservation.findMany({
      include: { user: { select: { id: true, name: true } }, book: true },
      orderBy: { reservedAt: "desc" },
      skip,
      take,
    }),
    prisma.reservation.count(),
  ]);
}


export async function fulfillNextReservation(bookId: string) {
  const availableCopy = await prisma.copy.findFirst({
    where: { bookId, status: "AVAILABLE" },
  });
  if (!availableCopy) return;

  const nextReservation = await prisma.reservation.findFirst({
    where: { bookId, status: "WAITING" },
    orderBy: { reservedAt: "asc" },
  });
  if (!nextReservation) return;

  const expiryDate = new Date(Date.now() + HOLD_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.reservation.update({
      where: { id: nextReservation.id },
      data: { status: "FULFILLED", expiryDate, fulfilledCopyId: availableCopy.id },
    }),
    prisma.copy.update({
      where: { id: availableCopy.id },
      data: { status: "RESERVED" }, // or whatever your CopyStatus enum uses for "held, not yet picked up"
    }),
  ]);
}


export async function expireStaleReservations() {
  const expired = await prisma.reservation.findMany({
    where: { status: "FULFILLED", expiryDate: { lt: new Date() } },
  });

  for (const reservation of expired) {
    if (!reservation.fulfilledCopyId) continue; // shouldn't happen for FULFILLED, but guard anyway

    await prisma.$transaction([
      prisma.reservation.update({ where: { id: reservation.id }, data: { status: "EXPIRED" } }),
      prisma.copy.update({ where: { id: reservation.fulfilledCopyId }, data: { status: "AVAILABLE" } }),
    ]);

    await fulfillNextReservation(reservation.bookId);
  }

  return expired.length;
}