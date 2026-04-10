import { api } from "../api/api";

export async function getGoals() {
  const response = await api.get("api/goals");

  return response.data;
}

export async function createGoal(data: any) {
  const response = await api.post("api/goals", data);

  return response.data.goal ?? response.data;
}

export async function updateGoal(id: string, data: any) {
  const response = await api.put(`api/goals/${id}`, data);

  return response.data.goal ?? response.data;
}

export async function deleteGoal(id: string) {
  const response = await api.delete(`api/goals/${id}`);

  return response.data;
}

export async function getGoalById(id: any) {
  const response = await api.get(`api/goals/${id}`);

  return response.data;
}
