import { useMemo } from "react";
import { useWallets } from "@/contexts/walletContext";

export function useBalance() {
  const { wallets } = useWallets();

  const totalBalance = useMemo(() => {
    return (wallets ?? []).reduce((total, wallet) => total + wallet.balance, 0);
  }, [wallets]);

  const walletCount = (wallets ?? []).length;

  function format(value: number) {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return {
    totalBalance,
    formattedBalance: format(totalBalance),
    walletCount,
  };
}