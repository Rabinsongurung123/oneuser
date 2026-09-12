import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreatePublisherInput, UpdatePublisherInput } from "./publisher.validation";

export function getAllPublishers(search?: string) {
  return prisma.publisher.findMany({
    where: search ? { name: { contains: search, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
  });
}

export async function getPublisherById(id: string) {
  const publisher = await prisma.publisher.findUnique({ where: { id } });
  if (!publisher) throw ApiError.notFound(`Publisher with id '${id}' not found`);
  return publisher;
}

export async function createPublisher(input: CreatePublisherInput) {
  const existing = await prisma.publisher.findUnique({ where: { name: input.name } });
  if (existing) throw ApiError.conflict(`A publisher named '${input.name}' already exists`);
  return prisma.publisher.create({ data: input });
}

export async function updatePublisher(id: string, input: UpdatePublisherInput) {
  await getPublisherById(id);
  return prisma.publisher.update({ where: { id }, data: input });
}

export async function deletePublisher(id: string) {
  await getPublisherById(id);
  const booksByPublisher = await prisma.book.count({ where: { publisherId: id } });
  if (booksByPublisher > 0) {
    throw ApiError.conflict(`Cannot delete publisher: ${booksByPublisher} book(s) still reference them`);
  }
  return prisma.publisher.delete({ where: { id } });
}