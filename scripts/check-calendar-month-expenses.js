import { db } from "../lib/prisma.js";

const ACCOUNT_ID = "a2929346-e72f-4001-b891-f40f1dfd7a8d";
(async () => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0,0,0,0);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23,59,59,999);

    console.log('Calendar month window:', start.toISOString(), '-', end.toISOString());

    const agg = await db.transaction.aggregate({
      where: { accountID: ACCOUNT_ID, type: 'EXPENSE', date: { gte: start, lte: end } },
      _sum: { amount: true },
    });

    console.log('Calendar-month expense sum:', agg._sum.amount ? agg._sum.amount.toString() : '0');
    const txs = await db.transaction.findMany({ where: { accountID: ACCOUNT_ID, type: 'EXPENSE', date: { gte: start, lte: end } }, orderBy: { date: 'asc' } });
    console.log('Count expenses in month:', txs.length);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
