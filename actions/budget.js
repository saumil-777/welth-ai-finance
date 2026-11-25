"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCurrentBudget(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentDate = new Date();

    // Use calendar month (start/end of current month) to match tutorial behavior
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        accountId: accountId,
        type: "EXPENSE",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Debugging info: log key values to help diagnose zero sums
    try {
      console.log("getCurrentBudget debug:", {
        userId: user.id,
        accountId,
        startDate: startDate?.toISOString?.() || startDate,
        endDate: endDate?.toISOString?.() || endDate,
        budget: budget ? { id: budget.id, amount: budget.amount.toString() } : null,
        expensesAggregate: expenses,
      });
    } catch (e) {
      console.log("getCurrentBudget debug log error", e);
    }

    const expensesSum = expenses._sum.amount ? expenses._sum.amount.toNumber() : 0;

    // serialize budget and apply tutorial-friendly default if seeded placeholder used
    const serializedBudget = budget
      ? {
          id: budget.id,
          amount: budget.amount.toNumber(),
          lastAlertSent: budget.lastAlertSent,
          userId: budget.userId,
          createdAT: budget.createdAT,
          updatedAT: budget.updatedAT,
        }
      : null;

    // If the DB contains the seeded placeholder (very large number), treat as unset and use tutorial default
    const TUTORIAL_DEFAULT = 7500;
    let budgetAmount = serializedBudget ? serializedBudget.amount : null;
    if (budgetAmount === null || budgetAmount >= 999999) {
      budgetAmount = TUTORIAL_DEFAULT;
    }

    const percentUsed = budgetAmount ? (expensesSum / budgetAmount) * 100 : 0;

    return {
      budget: serializedBudget ? { ...serializedBudget, amount: budgetAmount } : { amount: budgetAmount },
      currentExpenses: expensesSum,
      expenses: expensesSum,
      percentUsed,
    };
  } catch (error) {
    console.error("Error fetching budget:", error);
    throw error;
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount },
      create: { userId: user.id, amount },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...budget,
        amount: budget.amount.toNumber(),
      },
    };
  } catch (error) {
    console.error("Error updating budget:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}