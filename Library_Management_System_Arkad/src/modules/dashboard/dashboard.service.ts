import prisma from "../../prisma/client";

export async function getDashboardStats() {
  const [
    totalStudents,
    totalBooks,
    borrowedBooks,
    availableCopies,
    overdueBooks,
    recentBorrows,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.book.count(),
    prisma.borrow.count({ where: { status: "BORROWED" } }),
    prisma.copy.count({ where: { status: "AVAILABLE" } }),
    prisma.borrow.count({
      where: { status: "BORROWED", dueDate: { lt: new Date() } },
    }),
    prisma.borrow.findMany({
      take: 5,
      orderBy: { borrowDate: "desc" },
      include: {
        user: { select: { id: true, name: true, studentId: true } },
        copy: {
          select: {
            id: true,
            barcode: true,
            book: { select: { id: true, title: true } },
          },
        },
      },
    }),
  ]);

  return {
    totalStudents,
    totalBooks,
    borrowedBooks,
    availableBooks: availableCopies,
    overdueBooks,
    recentBorrowActivity: recentBorrows,
  };
}