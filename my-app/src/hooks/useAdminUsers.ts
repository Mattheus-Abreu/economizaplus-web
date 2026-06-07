import { api } from "@/api/api";
import useAuth from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";

export type AdminUserDetail = {
  id: string;
  name: string;
  email: string;
  role: "COMMON" | "ADMIN";
  plan: string;
  authProvider: string;
  createdAt: string;
  transactionCount: number;
  totalAmount: number;
};

export type AdminUpdateUserPayload = {
  name?: string;
  email?: string;
  role?: "COMMON" | "ADMIN";
  plan?: string;
};

export function useAdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUserDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<AdminUserDetail[]>("/api/admin/users", { headers });
      setUsers(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getById = useCallback(async (id: string): Promise<AdminUserDetail> => {
    const res = await api.get<AdminUserDetail>(`/api/admin/users/${id}`, { headers });
    return res.data;
  }, [token]);

  const update = useCallback(async (id: string, payload: AdminUpdateUserPayload): Promise<AdminUserDetail> => {
    const res = await api.put<AdminUserDetail>(`/api/admin/users/${id}`, payload, { headers });
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)));
    return res.data;
  }, [token]);

  const remove = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/api/admin/users/${id}`, { headers });
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, [token]);

  return { users, isLoading, error, refetch: fetchAll, getById, update, remove };
}