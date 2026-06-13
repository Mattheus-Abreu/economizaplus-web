import { api } from "@/api/api";

export async function loadCategorires() {
  const response = await api.get("/api/categories");

  return response.data;
}

export async function addCategory(data: any) {
  const response = await api.post("/api/categories", data);

  return response.data.goal ?? response.data;
}

export async function updateCategory(id: string, data: any) {
  const response = await api.put(`/api/categories/${id}`, data);

  return response.data.goal ?? response.data;
}

export async function deleteCategory(id: string) {
  const response = await api.delete(`/api/categories/${id}`);

  return response.data;
}

export async function getCategoryById(id: string) {
  const response = await api.get(`/api/categories/${id}`);

  return response.data;
}

export async function getCategoriesByWalletId(walletId: string) {
  const response = await api.get(`/api/categories/wallet/${walletId}`);

  return response.data;
}
