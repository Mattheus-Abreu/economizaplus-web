import React, { createContext, useContext, useEffect, useState } from "react";
import { savingService } from "@/services/savingService";
import { useGoals } from "./goalContext";
import Saving from "@/types/savings";
import { useWallets } from "./walletContext";

type CreateSavingInput = {
  goalId: string;
  walletId: string;
  amount: number;
  createdAt: string;
};

type SavingContextData = {
  savings: Saving[];
  addSaving: (data: CreateSavingInput) => Promise<void>;
  loadSavings: (goalId?: string) => Promise<void>;
  getSavingsByGoal: (goalId: string) => Saving[];
};

const SavingContext = createContext<SavingContextData>({} as SavingContextData);

export function SavingProvider({ children }: { children: React.ReactNode }) {
  const [savings, setSavings] = useState<Saving[]>([]);
  const { loadGoals } = useGoals(); 
  const { loadWallets } = useWallets();

  useEffect(() => {
    loadSavings();
  }, []);

  async function loadSavings(goalId?: string) {
    try {
      if (!goalId) return; 
      const data = await savingService.getSavingsByGoal(goalId);
      setSavings(data ?? []);
    } catch (error) {
      console.log("Erro ao carregar savings:", error);
      setSavings([]);
    }
  }

  async function addSaving(data: CreateSavingInput) {
    await savingService.createSaving({
      ...data,
      createdAt: new Date(data.createdAt).toISOString(),
    });

    await Promise.all([
      loadGoals(),
      loadSavings(data.goalId),
      loadWallets(),
    ]);
  }

  function getSavingsByGoal(goalId: string): Saving[] {
    return savings.filter((s) => s.goalId === goalId);
  }

  return (
    <SavingContext.Provider value={{ savings, addSaving, loadSavings, getSavingsByGoal }}>
      {children}
    </SavingContext.Provider>
  );
}

export function useSaving() {
  return useContext(SavingContext);
}