import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { getSettings } from "../settings/settings.service";

function daysBetween(later: Date, earlier: Date) {
  const ms = later.getTime() - earlier.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export async function calculateFineAmount(dueDate: Date, asOfDate: Date) {
  const settings = await getSettings();
  const overdueDays = daysBetween(asOfDate, dueDate);
  const chargeableDays = Math.max(0, overdueDays - settings.gracePeriodDays);
  const amount = chargeableDays * Number(settings.dailyFineRate);
  return { amount, chargeableDays };
}

export function upsertFineForBorrow(borrowId: string, amount: number) {
  return prisma.fine.upsert({
    where: { borrowId },
    update: { amount, calculatedAt: new Date() },
    create: { borrowId, amount, status: "PENDING" },
  });
}

export function getAllFines(skip: number, take: number, status?: string) {
  const where = status ? { status: status as any } : {};
  return Promise.all([
    prisma.fine.findMany({
      where,
      include: {
        borrow: {
          include: {
            user: true,
            copy: { include: { book: true } },
          },
        },
      },
      orderBy: { calculatedAt: "desc" },
      skip,
      take,
    }),
    prisma.fine.count({ where }),
  ]);
}

export function getFinesForUser(userId: string) {
  return prisma.fine.findMany({
    where: { borrow: { userId } },
    include: { borrow: { include: { copy: { include: { book: true } } } } },
    orderBy: { calculatedAt: "desc" },
  });
}

export async function payFine(fineId: string) {
  const fine = await prisma.fine.findUnique({ where: { id: fineId } });
  if (!fine) throw ApiError.notFound(`Fine with id '${fineId}' not found`);
  if (fine.status === "PAID") throw ApiError.conflict("This fine has already been paid");

  return prisma.fine.update({ where: { id: fineId }, data: { status: "PAID", paidAt: new Date() } });
}

export async function waiveFine(fineId: string) {
  const fine = await prisma.fine.findUnique({ where: { id: fineId } });
  if (!fine) throw ApiError.notFound(`Fine with id '${fineId}' not found`);
  if (fine.status === "PAID") throw ApiError.conflict("Cannot waive a fine that has already been paid");

  return prisma.fine.update({ where: { id: fineId }, data: { status: "WAIVED" } });
}