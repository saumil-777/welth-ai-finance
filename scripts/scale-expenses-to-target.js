import { db } from "../lib/prisma.js";

const ACCOUNT_ID = "a2929346-e72f-4001-b891-f40f1dfd7a8d";
const TARGET_TOTAL = 6924.68;

function round2(n) { return Math.round(n * 100) / 100; }

(async () => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0,0,0,0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23,59,59,999);

    const expenses = await db.transaction.findMany({
      where: { accountID: ACCOUNT_ID, type: 'EXPENSE', date: { gte: start, lte: end } },
    });

    const currentSum = expenses.reduce((s,t) => s + Number(t.amount), 0);
    console.log('Current expense sum:', currentSum);

    if (currentSum === 0) {
      console.log('No expenses to scale.');
      process.exit(0);
    }

    const ratio = TARGET_TOTAL / currentSum;
    console.log('Scaling ratio:', ratio);

    let newSum = 0;
    for (const t of expenses) {
      const newAmt = round2(Number(t.amount) * ratio);
      await db.transaction.update({ where: { id: t.id }, data: { amount: newAmt } });
      newSum += newAmt;
    }

    console.log('New target sum approx:', round2(newSum));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
