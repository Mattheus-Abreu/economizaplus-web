import { api } from "@/api/api";
import useAuth from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";

// ── Tipos espelhando a resposta do AdminService ───────────────────────────────

export type AdminOverview = {
  totalUsers: number;
  totalUsersVariation: number;
  activeToday: number;
  activeTodayVariation: number;
  monthlyRevenue: number;
  monthlyRevenueVariation: number;
  premiumUsers: number;
  premiumUsersPct: number;
};

export type AdminDailySignup = {
  date: string;
  label: string;
  count: number;
};

export type AdminPlanDistribution = {
  plan: string;
  count: number;
  color: string;
};

export type AdminTopUser = {
  id: string;
  name: string;
  plan: string;
  transactionCount: number;
  totalAmount: number;
};

export type AdminHealthMetric = {
  label: string;
  value: string;
  valueColor?: string;
};

export type AdminActivityItem = {
  id: string;
  type: "signup" | "cancel" | "upgrade" | "downgrade" | "peak" | "alert" | "payment" | "custom";
  message: string;
  highlight?: string;
  timeLabel: string;
};

export type AdminStats = {
  overview: AdminOverview;
  dailySignups: AdminDailySignup[];
  planDistribution: AdminPlanDistribution[];
  topUsers: AdminTopUser[];
  healthMetrics: AdminHealthMetric[];
  recentActivity: AdminActivityItem[];
};

type Status = "idle" | "loading" | "success" | "error";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { token } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    if (!token) return;
    setStatus("loading");
    api
      .get<AdminStats>("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setData(res.data);
        setStatus("success");
      })
      .catch((err) => {
        setError(err?.response?.data?.message ?? "Erro ao carregar métricas");
        setStatus("error");
      });
  }, [token]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    status,
    error,
    isLoading: status === "idle" || status === "loading",
    isError: status === "error",
    refetch: fetch,
  };
}