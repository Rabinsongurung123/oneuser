import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreateBookInput, UpdateBookInput } from "./books.validation";

const bookInclude = {
  category: true,
  publisher: true,
  authors: { include: { author: true } },
  copies: true,
};

function withCopyCounts<T extends { copies: { status: string }[] }>(book: T) {
  const totalCopies = book.copies.length;
  const availableCopies = book.copies.filter((c) => c.status === "AVAILABLE").length;
  return { ...book, totalCopies, availableCopies };
}

interface BookFilters {
  search?: string;
  authorId?: string;
  publisherId?: string;
  categoryId?: string;
}

export async function getAllBooks(filters: BookFilters, skip: number, take: number) {
  const { search, authorId, publisherId, categoryId } = filters;

  const where: any = {
    ...(authorId && { authors: { some: { authorId } } }),
    ...(publisherId && { publisherId }),
    ...(categoryId && { categoryId }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { isbn: { contains: search, mode: "insensitive" as const } },
        { authors: { some: { author: { name: { contains: search, mode: "insensitive" as const } } } } },
        { publisher: { name: { contains: search, mode: "insensitive" as const } } },
      ],
    }),
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, include: bookInclude, skip, take }),
    prisma.book.count({ where }),
  ]);

  return { books: books.map(withCopyCounts), total };
}

export async function getBookById(id: string) {
  const book = await prisma.book.findUnique({ where: { id }, include: bookInclude });
  if (!book) throw ApiError.notFound(`Book with id '${id}' not found`);
  return withCopyCounts(book);
}

export async function createBook(input: CreateBookInput & { coverImage?: string }) {
  const { authorIds, ...bookData } = input;

  const existingIsbn = await prisma.book.findUnique({ where: { isbn: input.isbn } });
  if (existingIsbn) throw ApiError.conflict(`A book with ISBN '${input.isbn}' already exists`);

  const book = await prisma.book.create({
    data: {
      ...bookData,
      authors: authorIds?.length ? { create: authorIds.map((authorId) => ({ authorId })) } : undefined,
    },
    include: bookInclude,
  });

  return withCopyCounts(book);
}

export async function updateBook(id: string, input: UpdateBookInput) {
  await getBookById(id);
  const { authorIds, ...bookData } = input;

  if (authorIds !== undefined) {
    await prisma.bookAuthor.deleteMany({ where: { bookId: id } });
  }

  const book = await prisma.book.update({
    where: { id },
    data: {
      ...bookData,
      ...(authorIds !== undefined && { authors: { create: authorIds.map((authorId) => ({ authorId })) } }),
    },
    include: bookInclude,
  });

  return withCopyCounts(book);
}

export async function deleteBook(id: string) {
  const book = await getBookById(id);
  if (book.copies.length > 0) {
    throw ApiError.conflict(
      `Cannot delete book: ${book.copies.length} cop${book.copies.length === 1 ? "y" : "ies"} still exist. Delete them first.`
    );
  }
  return prisma.book.delete({ where: { id } });
}

export async function searchBooks(q: string, skip: number, take: number) {
  const where: any = {
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { isbn: { contains: q, mode: "insensitive" as const } },
      { authors: { some: { author: { name: { contains: q, mode: "insensitive" as const } } } } },
      { publisher: { name: { contains: q, mode: "insensitive" as const } } },
    ],
  };

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, include: bookInclude, skip, take, orderBy: { title: "asc" } }),
    prisma.book.count({ where }),
  ]);

  return { books: books.map(withCopyCounts), total };
}

export async function getBooksByCategory(categoryName: string, skip: number, take: number) {
  const normalizedName = categoryName.replace(/-/g, " ");

  const category = await prisma.category.findFirst({
    where: { name: { equals: normalizedName, mode: "insensitive" } },
  });
  if (!category) throw ApiError.notFound(`Category '${categoryName}' not found`);

  const where = { categoryId: category.id };

  const [books, total] = await Promise.all([
    prisma.book.findMany({ where, include: bookInclude, skip, take, orderBy: { title: "asc" } }),
    prisma.book.count({ where }),
  ]);

  return { books: books.map(withCopyCounts), total };
}