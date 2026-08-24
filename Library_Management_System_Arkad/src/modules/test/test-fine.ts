import prisma from "@/prisma/client";
import { calculateFineAmount, upsertFineForBorrow } from "../fines/fine.service";

async function main() {
  // 1. Ensure settings exist with known values
  await prisma.librarySettings.upsert({
    where: { id: "default" },
    update: { dailyFineRate: 10, gracePeriodDays: 2 },
    create: { id: "default", dailyFineRate: 10, gracePeriodDays: 2 },
  });

  // 2. Grab a test user and a checked-out copy
const user = await prisma.user.findFirst({ where: { role: "MEMBER" } });
  const copy = await prisma.copy.findFirst({ where: { status: "CHECKED_OUT" } });

  if (!user || !copy) {
    console.log("Need at least one STUDENT user and one CHECKED_OUT copy to test with.");
    return;
  }

  // 3. Create a Borrow with a dueDate in the past (e.g. 10 days ago)
  const dueDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
  const borrow = await prisma.borrow.create({
    data: {
      userId: user.id,
      copyId: copy.id,
      borrowDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000),
      dueDate,
      status: "BORROWED",
    },
  });

  // 4. Run the function under test
  const { amount, chargeableDays } = await calculateFineAmount(dueDate, new Date());
  console.log({ chargeableDays, amount });
  // Expected: dailyFineRate=10, gracePeriodDays=2, 10 days overdue
  // chargeableDays = 8, amount = 80

  // 5. Confirm upsert writes/updates correctly
  const fine = await upsertFineForBorrow(borrow.id, amount);
  console.log(fine);

  // 6. Run it again to confirm it UPDATES instead of duplicating
  const fineAgain = await upsertFineForBorrow(borrow.id, amount);
  console.log(fineAgain.id === fine.id ? "✅ upsert updated same row" : "❌ created a duplicate");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());