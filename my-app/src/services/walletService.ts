import Wallet from "@/types/wallet";
import { api } from "../api/api";

export async function getWalletById(id: string): Promise<Wallet> {
  const response = await api.get(`/api/wallets/${id}`);

  return response.data;
}

export async function loadWallets(): Promise<Wallet[]> {
  const response = await api.get("/api/wallets");

  return response.data;
}

export async function addWallet(data: Partial<Wallet>): Promise<Wallet> {
  const response = await api.post("/api/wallets", data);

  return response.data.wallet ?? response.data;
}

export async function updateWallet(
  id: string,
  data: Partial<Wallet>,
): Promise<Wallet> {
  const response = await api.put(`/api/wallets/${id}`, data);

  return response.data.wallet ?? response.data;
}

export async function deleteWallet(id: string): Promise<Wallet> {
  const response = await api.delete(`/api/wallets/${id}`);

  return response.data;
}
