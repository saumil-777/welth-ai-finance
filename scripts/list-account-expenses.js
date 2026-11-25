import { db } from "../lib/prisma.js";

const ACCOUNT_ID = "a2929346-e72f-4001-b891-f40f1dfd7a8d"; // Work account from seed

(async () => {
  try {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setHours(23,59,59,999);
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - 29);
    startDate.setHours(0,0,0,0);

    const expenses = await db.transaction.findMany({
      where: {
        accountID: ACCOUNT_ID,
        type: 'EXPENSE',
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'desc' },
    });

    let sum = 0n;
    const items = expenses.map((t) => {
      const amt = BigInt(Math.round(Number(t.amount) * 100));
      sum += amt;
      return { id: t.id, amount: (Number(t.amount)).toFixed(2), date: t.date.toISOString(), description: t.description };
    });

    console.log('Window start:', startDate.toISOString());
    console.log('Window end:', endDate.toISOString());
    console.log('Account:', ACCOUNT_ID);
    console.log('Expense count:', items.length);
    console.log('Expenses:');
    items.forEach((it) => console.log(it));

    console.log('Computed sum:', (Number(sum) / 100).toFixed(2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
