import bcrypt from "bcrypt";
import prisma from "../../prisma/client";
import { ApiError } from "../../utils/apiError";
import { CreateStudentInput, UpdateStudentInput } from "./users.validation";

const publicSelect = {
  id: true,
  name: true,
  email: true,
  studentId: true,
  role: true,
  createdAt: true,
};

export async function getAllStudents(search: string | undefined, skip: number, take: number) {
  const where = {
    role: "STUDENT" as const,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { studentId: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [students, total] = await Promise.all([
    prisma.user.findMany({ where, select: publicSelect, skip, take }),
    prisma.user.count({ where }),
  ]);

  return { students, total };
}

export async function getStudentById(id: string) {
  const student = await prisma.user.findUnique({ where: { id }, select: publicSelect });
  if (!student) throw ApiError.notFound(`Student with id '${id}' not found`);
  return student;
}

export async function createStudent(input: CreateStudentInput) {
  const existingEmail = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingEmail) throw ApiError.conflict(`A user with email '${input.email}' already exists`);

  const existingStudentId = await prisma.user.findUnique({ where: { studentId: input.studentId } });
  if (existingStudentId) throw ApiError.conflict(`A student with ID '${input.studentId}' already exists`);

  const hashedPassword = await bcrypt.hash(input.password, 10);
  return prisma.user.create({
    data: { ...input, password: hashedPassword, role: "STUDENT" },
    select: publicSelect,
  });
}

export async function updateStudent(id: string, input: UpdateStudentInput) {
  await getStudentById(id);
  return prisma.user.update({ where: { id }, data: input, select: publicSelect });
}

export async function deleteStudent(id: string) {
  await getStudentById(id);
  const activeBorrow = await prisma.borrow.findFirst({ where: { userId: id, status: "BORROWED" } });
  if (activeBorrow) {
    throw ApiError.conflict("Cannot delete student: they have unreturned borrowed books");
  }
  return prisma.user.delete({ where: { id } });
}