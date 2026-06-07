import { api } from "@/api/api";
import useAuth from "@/hooks/useAuth";
import { useCallback, useEffect, useState } from "react";

type Status = "idle" | "loading" | "has_plan" | "no_plan" | "error";

export function useAIPlan() {
  const { token } = useAuth();
  const [status, setStatus] = useState<Status>("idle");

  const check = useCallback(() => {
    if (!token) return;
    setStatus("loading");
    api
      .get("/api/ai/tips", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => setStatus("has_plan"))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setStatus("no_plan");
        } else {
          setStatus("error");
        }
      });
  }, [token]);

  useEffect(() => {
    check();
  }, [check]);

  return { status, refetch: check };
}