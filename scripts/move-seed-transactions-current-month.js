import { db } from "../lib/prisma.js";

// Move transactions for the seeded Work account into the current calendar month
const ACCOUNT_ID = "a2929346-e72f-4001-b891-f40f1dfd7a8d";

function clampDay(year, month, day) {
  const last = new Date(year, month + 1, 0).getDate();
  return Math.min(day, last);
}

(async () => {
  try {
    const now = new Date();
    const targetYear = now.getFullYear();
    const targetMonth = now.getMonth(); // 0-based

    const txs = await db.transaction.findMany({
      where: { accountID: ACCOUNT_ID },
      orderBy: { date: 'asc' },
    });

    console.log('Found', txs.length, 'transactions for account', ACCOUNT_ID);

    for (const t of txs) {
      const d = new Date(t.date);
      const day = d.getDate();
      const hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();
      const ms = d.getMilliseconds();

      const newDay = clampDay(targetYear, targetMonth, day);
      const newDate = new Date(targetYear, targetMonth, newDay, hours, minutes, seconds, ms);

      await db.transaction.update({
        where: { id: t.id },
        data: { date: newDate, createdAT: newDate, updatedAT: newDate },
      });

      console.log('Updated', t.id, '->', newDate.toISOString());
    }

    console.log('Done moving transactions.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
