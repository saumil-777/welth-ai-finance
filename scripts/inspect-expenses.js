import { db } from "../lib/prisma.js";

(async () => {
  try {
    const currentDate = new Date();
      // Use last 30 days window (same as server change)
      const endOfMonth = new Date(currentDate);
      endOfMonth.setHours(23,59,59,999);

      const startOfMonth = new Date(currentDate);
      startOfMonth.setDate(currentDate.getDate() - 29);
      startOfMonth.setHours(0,0,0,0);

      console.log("Start:", startOfMonth.toISOString());
      console.log("End:", endOfMonth.toISOString());

    const accounts = await db.account.findMany();
    console.log("Accounts:", accounts.map((a) => ({ id: a.id, name: a.name, isDefault: a.isDefault })));

    for (const a of accounts) {
      const agg = await db.transaction.aggregate({
          where: {
            accountID: a.id,
            type: "EXPENSE",
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        });

      console.log(a.id, a.name, "expenseSum:", agg._sum.amount ? agg._sum.amount.toString() : "0");
    }

      const total = await db.transaction.count();
      console.log("Total transactions in DB:", total);

        const budgets = await db.budget.findMany();
        console.log("Budgets:", budgets.map(b => ({ id: b.id, amount: b.amount.toString(), userId: b.userId })));

      const latest = await db.transaction.findMany({
        orderBy: { date: 'desc' },
        take: 10,
      });

      console.log("Latest transactions:", latest.map(t => ({ id: t.id, type: t.type, amount: t.amount.toString(), date: t.date.toISOString(), accountID: t.accountID })));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
