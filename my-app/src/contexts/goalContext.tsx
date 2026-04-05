import * as goalService from "@/services/goalService";
import Goal from "@/types/goal";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";

type GoalContextType = {
  goals: Goal[];
  loadGoals: () => Promise<void>;
  addGoal: (data: any) => Promise<void>;
  updateGoal: (id: string, data: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getGoalById: (id: string) => Promise<Goal>;
};

const GoalContext = createContext({} as GoalContextType);

export function GoalProvider({ children }: any) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const { token, isReady } = useContext(AuthContext);

  async function loadGoals() {
    const data = await goalService.getGoals();
    setGoals(data);
  }

  async function addGoal(data: any) {
    const newGoal = await goalService.createGoal(data);
    setGoals((prev) => [...prev, newGoal]);
  }

  async function updateGoalById(id: string, data: any) {
    const updated = await goalService.updateGoal(id, data);
    setGoals((prev) => prev.map((goal) => (goal.id === id ? updated : goal)));
  }

  async function deleteGoalById(id: string) {
    await goalService.deleteGoal(id);
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  }

  async function getGoalById(id: string) {
    const goal = await goalService.getGoalById(id);
    return goal;
  }

  useEffect(() => {
    if (!isReady || !token) return;

    loadGoals();
  }, [isReady, token]);

  return (
    <GoalContext.Provider
      value={{
        goals,
        loadGoals,
        addGoal,
        updateGoal: updateGoalById,
        deleteGoal: deleteGoalById,
        getGoalById,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  return useContext(GoalContext);
}
