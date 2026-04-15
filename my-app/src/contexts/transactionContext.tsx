import Transaction from "@/types/transaction";
import * as transactionService from "@/services/transactionService";
import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./authContext";
import { useWallets } from "./walletContext";

type TransactionContextType = {
  transactions: Transaction[];
  loadTransactions: () => Promise<void>;
  addTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

const TransactionContext = createContext({} as TransactionContextType);

export function TransactionProvider({ children }: any) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { token, isReady } = useContext(AuthContext);
  const { loadWallets } = useWallets(); 

  async function loadTransactions() {
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.log("Erro ao carregar transações:", error);
    }
  }

  async function addTransaction(data: any) {
    await transactionService.addTransaction(data);
    await Promise.all([loadTransactions(), loadWallets()]);
  }

  async function updateTransaction(id: string, data: any) {
    await transactionService.updateTransaction(id, data);
    await Promise.all([loadTransactions(), loadWallets()]);
  }

  async function deleteTransaction(id: string) {
    await transactionService.deleteTransaction(id);
    await Promise.all([loadTransactions(), loadWallets()]);
  }

  useEffect(() => {
    if (!token || !isReady) return;
    loadTransactions();
  }, [token, isReady]);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loadTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  return useContext(TransactionContext);
}

export default TransactionProvider;