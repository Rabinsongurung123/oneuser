import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreateCategoryInput, UpdateCategoryInput } from "./category.validation";

export function getAllCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw ApiError.notFound(`Category with id '${id}' not found`);
  return category;
}

export function createCategory(input: CreateCategoryInput) {
  return prisma.category.create({ data: input });
}

export async function updateCategory(id: string, input: UpdateCategoryInput) {
  await getCategoryById(id);
  return prisma.category.update({ where: { id }, data: input });
}

export async function deleteCategory(id: string) {
  await getCategoryById(id);
  const booksInCategory = await prisma.book.count({ where: { categoryId: id } });
  if (booksInCategory > 0) {
    throw ApiError.conflict(`Cannot delete category: ${booksInCategory} book(s) still reference it`);
  }
  return prisma.category.delete({ where: { id } });
}