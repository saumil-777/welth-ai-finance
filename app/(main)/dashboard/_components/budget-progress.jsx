"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { updateBudget } from "@/actions/budget";
import { Pencil } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";




const BudgetProgress = ({ initialBudget, currentExpenses, percentUsed: serverPercent }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );
  // Local budget amount to reflect optimistic updates without waiting for server revalidation
  const [localBudgetAmount, setLocalBudgetAmount] = useState(
    initialBudget?.amount ?? null
  );

  let percentUsed = typeof serverPercent === "number" ? serverPercent : null;

  if (percentUsed === null) {
    const base = localBudgetAmount ?? initialBudget?.amount ?? null;
    percentUsed = base ? (currentExpenses / base) * 100 : 0;
  }

  // clamp to 0-100 and guard NaN/Infinity
  if (!isFinite(percentUsed) || isNaN(percentUsed)) percentUsed = 0;
  percentUsed = Math.max(0, Math.min(100, percentUsed));




    


const {
  loading: isLoading,
  fn: updateBudgetFn,
  data: updatedBudget,
  error,
} = useFetch(updateBudget);

  const handleUpdateBudget = async() => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
    }

    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
        const newAmt = updatedBudget.data?.amount ?? parseFloat(newBudget);
        setLocalBudgetAmount(newAmt);
        setNewBudget(newAmt?.toString?.() || "");
        setIsEditing(false);
        toast.success("Budget updated successfully");
    }
}, [updatedBudget]); 

useEffect(() => {
    if (error) {
        toast.error(error.message || "Failed to update budget");
    }
}, [error]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
       

        <div className="flex-1">
             <CardTitle className="text-sm font-medium">
  Monthly Budget (Default Account)
</CardTitle>
             <div className = "flex items-center gap-2 mt-1">
          {isEditing ? (
            <div className = "flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-32"
                placeholder="Enter amount"
                autoFocus
                disabled={isLoading}
                
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                disabled={isLoading}
              >
                <Check className="h-4 w-4 text-green-500" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <>
              <CardDescription>
                { (localBudgetAmount ?? initialBudget?.amount) ?
                  `₹${currentExpenses.toFixed(2)} of ₹${(localBudgetAmount ?? initialBudget.amount).toFixed(2)} spent`
                  : "No budget set" }
              </CardDescription>
              <Button 
              variant = "ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-6 w-6"
            >
                    <Pencil className = "h-3 w-3" />
            </Button>
            </>
          )}
          </div>
        </div>

        
      </CardHeader>

  <CardContent>
  {initialBudget && (
    <div className="space-y-2">
      <Progress
        value={percentUsed}
        extraStyles={`${
          percentUsed >= 90
            ? "bg-red-500"
            : percentUsed >= 75
            ? "bg-yellow-500"
            : "bg-green-500"
        }`}
      />

      <p className="text-xs text-muted-foreground text-right">
        {percentUsed.toFixed(2)}% used
      </p>
    </div>
  )}
</CardContent>

      
    </Card>
  );
};

export default BudgetProgress;