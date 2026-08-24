import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { BorrowBookInput } from "./borrow.validation";
import { calculateFineAmount, upsertFineForBorrow } from "../fines/fine.service";
import { fulfillNextReservation } from "../reservations/reservation.service";

const DEFAULT_LOAN_DAYS = 14;

export async function borrowBook(input: BorrowBookInput, requesterId: string, requesterRole: string) {
  const userId = requesterRole === "ADMIN" && input.userId ? input.userId : requesterId;

  let copy;
  let heldReservationId: string | undefined;

  if (input.copyId) {
    copy = await prisma.copy.findUnique({ where: { id: input.copyId }, include: { book: true } });
    if (!copy) throw ApiError.notFound(`Copy with id '${input.copyId}' not found`);

    if (copy.status === "RESERVED") {
      const reservation = await prisma.reservation.findFirst({
        where: { fulfilledCopyId: copy.id, status: "FULFILLED" },
      });
      if (!reservation || reservation.userId !== userId) {
        throw ApiError.conflict("This copy is held for another member's reservation");
      }
      heldReservationId = reservation.id;
    } else if (copy.status !== "AVAILABLE") {
      throw ApiError.conflict(`This copy is not available (current status: ${copy.status})`);
    }
  } else {
    // Prefer a copy already held for this user via a fulfilled reservation
    const heldReservation = await prisma.reservation.findFirst({
      where: { bookId: input.bookId, userId, status: "FULFILLED" },
    });

    if (heldReservation?.fulfilledCopyId) {
      copy = await prisma.copy.findUnique({ where: { id: heldReservation.fulfilledCopyId }, include: { book: true } });
      heldReservationId = heldReservation.id;
    } else {
      copy = await prisma.copy.findFirst({ where: { bookId: input.bookId, status: "AVAILABLE" }, include: { book: true } });
    }
    if (!copy) throw ApiError.conflict("No available copies of this book to borrow");
  }

  const alreadyBorrowed = await prisma.borrow.findFirst({
    where: { userId, copy: { bookId: copy.bookId }, status: { in: ["BORROWED", "OVERDUE"] } },
  });
  if (alreadyBorrowed) {
    throw ApiError.conflict(`This user already has '${copy.book.title}' borrowed and not yet returned`);
  }

  const dueDate = input.dueDate
    ? new Date(input.dueDate)
    : new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000);

  const [borrow] = await prisma.$transaction([
    prisma.borrow.create({ data: { userId, copyId: copy.id, dueDate, status: "BORROWED" } }),
    prisma.copy.update({ where: { id: copy.id }, data: { status: "CHECKED_OUT" } }),
    ...(heldReservationId
      ? [prisma.reservation.update({ where: { id: heldReservationId }, data: { status: "COMPLETED" } })]
      : []),
  ]);

  return borrow;
}

export async function returnBook(borrowId: string) {
  const borrow = await prisma.borrow.findUnique({
    where: { id: borrowId },
    include: { copy: true },
  });
  if (!borrow) throw ApiError.notFound(`Borrow record with id '${borrowId}' not found`);
  if (borrow.status === "RETURNED") throw ApiError.conflict("This book has already been returned");

  const returnDate = new Date();
  const { amount } = await calculateFineAmount(borrow.dueDate, returnDate);

  const [updatedBorrow] = await prisma.$transaction([
    prisma.borrow.update({ where: { id: borrowId }, data: { status: "RETURNED", returnDate } }),
    prisma.copy.update({ where: { id: borrow.copyId }, data: { status: "AVAILABLE" } }),
  ]);

  if (amount > 0) {
    await upsertFineForBorrow(borrowId, amount);
  }

  await fulfillNextReservation(borrow.copy.bookId);

  return updatedBorrow;
}

export async function getAllBorrowRecords(skip: number, take: number) {
  const [records, total] = await Promise.all([
    prisma.borrow.findMany({
      include: {
        user: { select: { id: true, name: true, studentId: true } },
        copy: { include: { book: true } },
      },
      orderBy: { borrowDate: "desc" },
      skip,
      take,
    }),
    prisma.borrow.count(),
  ]);
  return { records, total };
}

export async function getBorrowHistoryForStudent(userId: string) {
  const student = await prisma.user.findUnique({ where: { id: userId } });
  if (!student) throw ApiError.notFound(`Student with id '${userId}' not found`);

  return prisma.borrow.findMany({
    where: { userId },
    include: { copy: { include: { book: true } } },
    orderBy: { borrowDate: "desc" },
  });
}


export async function getCurrentBorrowedBook(studentId: string) {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) throw ApiError.notFound(`Student with id '${studentId}' not found`);

  const activeBorrow = await prisma.borrow.findFirst({
    where: {
      userId: studentId,
      status: "BORROWED",
    },
    include: {
      copy: {
        select: {
          id: true,
          barcode: true,
          shelfLocation: true,
          book: {
            select: {
              id: true,
              title: true,
              coverImage: true,
            },
          },
        },
      },
    },
  });

  return activeBorrow; // null if student has no active borrow, but 404 if student doesn't exist
}