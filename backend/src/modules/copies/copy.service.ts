import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreateCopyInput, UpdateCopyInput } from "./copy.validation";

export function getCopiesForBook(bookId: string) {
  return prisma.copy.findMany({ where: { bookId }, orderBy: { createdAt: "asc" } });
}

export async function getCopyById(id: string) {
  const copy = await prisma.copy.findUnique({ where: { id }, include: { book: true } });
  if (!copy) throw ApiError.notFound(`Copy with id '${id}' not found`);
  return copy;
}

export async function createCopy(input: CreateCopyInput) {
  const book = await prisma.book.findUnique({ where: { id: input.bookId } });
  if (!book) throw ApiError.notFound(`Book with id '${input.bookId}' not found`);

  const existingBarcode = await prisma.copy.findUnique({ where: { barcode: input.barcode } });
  if (existingBarcode) throw ApiError.conflict(`A copy with barcode '${input.barcode}' already exists`);

  return prisma.copy.create({ data: input });
}

export async function updateCopy(id: string, input: UpdateCopyInput) {
  await getCopyById(id);
  return prisma.copy.update({ where: { id }, data: input });
}

export async function deleteCopy(id: string) {
  await getCopyById(id);
  const activeBorrow = await prisma.borrow.findFirst({
    where: { copyId: id, status: { in: ["BORROWED", "OVERDUE"] } },
  });
  if (activeBorrow) throw ApiError.conflict("Cannot delete copy: it is currently checked out");

  return prisma.copy.delete({ where: { id } });
}