import bcrypt from "bcrypt";
import prisma from "./client";

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@library.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@library.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
  console.log("✅ Admin seeded");

  // Librarian
  await prisma.user.upsert({
    where: { email: "librarian@library.com" },
    update: {},
    create: {
      name: "Librarian User",
      email: "librarian@library.com",
      password: hashedPassword,
      role: "LIBRARIAN",
    },
  });
  console.log("✅ Librarian seeded");

  // Member
  await prisma.user.upsert({
    where: { email: "member@library.com" },
    update: {},
    create: {
      name: "Member User",
      email: "member@library.com",
      password: hashedPassword,
      role: "MEMBER",
      studentId: "STU-001",
    },
  });
  console.log("✅ Member seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());