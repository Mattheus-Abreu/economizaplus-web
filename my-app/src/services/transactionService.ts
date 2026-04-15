import { api } from "../api/api";

export async function getTransactions() {
  const response = await api.get("/api/transactions");

  return response.data;
}

export async function addTransaction(data: any) {
  const response = await api.post("/api/transactions", data);

  return response.data;
}

export async function updateTransaction(id: string, data: any) {
  const response = await api.put(`/api/transactions/${id}`, data);

  return response.data;
}

export async function deleteTransaction(id: string) {
  const response = await api.delete(`/api/transactions/${id}`);

  return response.data;
}