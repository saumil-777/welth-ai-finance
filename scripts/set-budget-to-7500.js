import { db } from "../lib/prisma.js";

(async () => {
  try {
    const userId = '4068dd94-6969-4ea6-9f6a-e7532572f1c3';
    const budget = await db.budget.upsert({
      where: { userId },
      update: { amount: 7500 },
      create: { userId, amount: 7500 },
    });

    console.log('Budget set:', { id: budget.id, amount: budget.amount.toString(), userId: budget.userId });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
