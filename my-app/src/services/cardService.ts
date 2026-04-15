import { api } from "@/api/api";

export async function addCard(data: any) {
  const response = await api.post("/api/cards", data);

  return response.data.card ?? response.data;
}

export async function getCards() {
  const response = await api.get("/api/cards");

  return response.data;
}   

export async function deleteCard(id: string) {
  const response = await api.delete(`/api/cards/${id}`);    

  return response.data;
}

export async function getCardById(id: string) {
  const response = await api.get(`/api/cards/${id}`);

  return response.data;
}

export async function updateCard(id: string, data: any) {
  const response = await api.put(`/api/cards/${id}`, data);

  return response.data.card ?? response.data;
}

