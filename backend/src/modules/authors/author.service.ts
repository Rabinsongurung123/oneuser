import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreateAuthorInput, UpdateAuthorInput } from "./author.validation";

export function getAllAuthors(search: string | undefined, skip: number, take: number) {
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

  return Promise.all([
    prisma.author.findMany({ where, orderBy: { name: "asc" }, skip, take }),
    prisma.author.count({ where }),
  ]);
}

export async function getAuthorById(id: string) {
  const author = await prisma.author.findUnique({ where: { id } });
  if (!author) throw ApiError.notFound(`Author with id '${id}' not found`);
  return author;
}

export function createAuthor(input: CreateAuthorInput) {
  return prisma.author.create({ data: input });
}

export async function updateAuthor(id: string, input: UpdateAuthorInput) {
  await getAuthorById(id);
  return prisma.author.update({ where: { id }, data: input });
}

export async function deleteAuthor(id: string) {
  await getAuthorById(id);

  const booksByAuthor = await prisma.bookAuthor.count({
    where: {
      authorId: id,
    },
  });

  if (booksByAuthor > 0) {
    throw ApiError.conflict(
      `Cannot delete author: ${booksByAuthor} book(s) still reference them`
    );
  }

  return prisma.author.delete({
    where: { id },
  });
}