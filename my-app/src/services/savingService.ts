import { api } from "@/api/api";
import CreateSavingDTO from "@/DTO/savingDTO";
import Saving from "@/types/savings";

export type SavingResponse = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  percentageComplete: number;
};

export const savingService = {
  async createSaving(data: CreateSavingDTO): Promise<SavingResponse> {
    const response = await api.post("api/savings", data);
    return response.data;
  },

  async getSavingsByGoal(goalId: string): Promise<Saving[]> {
    const response = await api.get(`api/savings/goal/${goalId}`);
    return response.data;
  },
};