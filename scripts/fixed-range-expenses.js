import { db } from "../lib/prisma.js";

const ACCOUNT_ID = "a2929346-e72f-4001-b891-f40f1dfd7a8d";
const start = new Date('2026-07-23T00:00:00.000Z');
const end = new Date('2026-07-23T23:59:59.999Z');

(async () => {
  try {
    const expenses = await db.transaction.findMany({
      where: {
        accountID: ACCOUNT_ID,
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    console.log('Range:', start.toISOString(), '-', end.toISOString());
    expenses.forEach(t => console.log({ id: t.id, amount: t.amount.toString(), date: t.date.toISOString(), description: t.description }));

    const total = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    console.log('Total:', total.toFixed(2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
